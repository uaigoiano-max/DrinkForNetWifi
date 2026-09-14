#!/usr/bin/lua
-- DrinkForNet local voucher core.
-- The file format deliberately stores only SHA-256 token digests.

local STATE_DIR = os.getenv("DRINKFORNET_STATE_DIR") or "/var/lib/drinkfornet"
local DB_FILE = os.getenv("DRINKFORNET_DB") or (STATE_DIR .. "/vouchers.tsv")
local AUDIT_FILE = os.getenv("DRINKFORNET_AUDIT") or (STATE_DIR .. "/audit.log")
local LOCK_DIR = DB_FILE .. ".lock"
local DURATION = 1500
local ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

local function shell_quote(value)
    return "'" .. tostring(value):gsub("'", "'\"'\"'") .. "'"
end

local function command_ok(command)
    local a, b, c = os.execute(command)
    if type(a) == "number" then return a == 0 end
    return a == true and (c == nil or c == 0)
end

local function ensure_state()
    if not command_ok("mkdir -p " .. shell_quote(STATE_DIR)) then
        return nil, "cannot create state directory"
    end
    return true
end

local function lock()
    if not ensure_state() then return nil, "state unavailable" end
    for _ = 1, 20 do
        if command_ok("mkdir " .. shell_quote(LOCK_DIR) .. " 2>/dev/null") then return true end
        os.execute("sleep 1")
    end
    return nil, "state lock timeout"
end

local function unlock()
    os.execute("rmdir " .. shell_quote(LOCK_DIR) .. " 2>/dev/null")
end

local function now()
    return os.time()
end

local function normalize(token)
    local value = tostring(token or ""):upper():gsub("%s+", ""):gsub("-", "")
    if not value:match("^DFN[A-Z0-9]+$") or #value > 64 then return nil end
    return value
end

local function sha256(value)
    local pipe = io.popen("printf '%s' " .. shell_quote(value) .. " | sha256sum 2>/dev/null", "r")
    if not pipe then return nil, "sha256sum unavailable" end
    local line = pipe:read("*l") or ""
    pipe:close()
    local digest = line:match("^([0-9a-fA-F]+)")
    if not digest or #digest ~= 64 then return nil, "sha256sum unavailable" end
    return digest:lower()
end

local function random_token()
    local source = io.open("/dev/urandom", "rb")
    if not source then return nil, "cryptographic random source unavailable" end
    local output = {}
    for i = 1, 24 do
        local byte = source:read(1)
        if not byte then source:close(); return nil, "cryptographic random source unavailable" end
        local index = (string.byte(byte) % #ALPHABET) + 1
        output[i] = ALPHABET:sub(index, index)
    end
    source:close()
    local raw = table.concat(output)
    return "DFN-" .. raw:sub(1, 8) .. "-" .. raw:sub(9, 16) .. "-" .. raw:sub(17, 24)
end

local function split(line)
    local fields = {}
    for field in (line .. "\t"):gmatch("(.-)\t") do fields[#fields + 1] = field end
    return fields
end

local function load_records()
    local records = {}
    local file = io.open(DB_FILE, "r")
    if not file then return records end
    for line in file:lines() do
        if line ~= "" and line:sub(1, 1) ~= "#" then
            local f = split(line)
            if #f >= 7 then
                records[#records + 1] = {
                    id = f[1], hash = f[2], state = f[3], created = tonumber(f[4]) or 0,
                    activated = tonumber(f[5]) or 0, expires = tonumber(f[6]) or 0,
                    revoked = tonumber(f[7]) or 0
                }
            end
        end
    end
    file:close()
    return records
end

local function save_records(records)
    local temporary = DB_FILE .. ".new." .. tostring(now())
    local file, error_message = io.open(temporary, "w")
    if not file then return nil, error_message end
    file:write("# id\ttoken_sha256\tstate\tcreated_epoch\tactivated_epoch\texpires_epoch\trevoked_epoch\n")
    for _, record in ipairs(records) do
        file:write(table.concat({
            record.id, record.hash, record.state, record.created, record.activated,
            record.expires, record.revoked
        }, "\t"), "\n")
    end
    file:flush()
    file:close()
    if not os.rename(temporary, DB_FILE) then
        os.remove(temporary)
        return nil, "cannot atomically replace voucher database"
    end
    return true
end

local function audit(action, record, detail)
    local file = io.open(AUDIT_FILE, "a")
    if file then
        file:write(now(), "\t", action, "\t", record and record.id or "-", "\t",
            record and record.state or "-", "\t", detail or "-", "\n")
        file:close()
    end
end

local function reconcile(records)
    local changed = false
    local timestamp = now()
    for _, record in ipairs(records) do
        if record.state == "ACTIVE" and record.expires > 0 and record.expires <= timestamp then
            record.state = "EXPIRED"
            changed = true
            audit("expire", record, "reboot-or-cron-reconciliation")
        end
    end
    return changed
end

local function json_escape(value)
    value = tostring(value or "")
    return value:gsub("\\", "\\\\"):gsub('"', '\\"'):gsub("\n", "\\n"):gsub("\r", "\\r")
end

local function print_json(value)
    io.write(value, "\n")
end

local function record_json(record, token)
    return string.format('{"id":"%s","state":"%s","created":%d,"activated":%d,"expires":%d,"revoked":%d%s}',
        json_escape(record.id), json_escape(record.state), record.created, record.activated,
        record.expires, record.revoked, token and ',"voucher":"' .. json_escape(token) .. '"' or "")
end

local function fail(message, json)
    if json then
        print_json('{"ok":false,"error":"' .. json_escape(message) .. '"}')
    else
        io.stderr:write("ERROR: ", message, "\n")
    end
    return false
end

local function with_lock(fn)
    local acquired, error_message = lock()
    if not acquired then return nil, error_message end
    local ok, result, extra = pcall(fn)
    unlock()
    if not ok then return nil, result end
    return result, extra
end

local function action_generate(count, json)
    count = tonumber(count) or 1
    if count < 1 or count > 100 or count % 1 ~= 0 then return fail("count must be an integer from 1 to 100", json) end
    local result, error_message = with_lock(function()
        local records = load_records()
        reconcile(records)
        local generated = {}
        local next_id = 0
        for _, record in ipairs(records) do
            local number = tonumber(record.id:match("^v(%d+)$") or "0") or 0
            if number > next_id then next_id = number end
        end
        for _ = 1, count do
            local token, random_error = random_token()
            if not token then error(random_error) end
            local digest, hash_error = sha256(normalize(token))
            if not digest then error(hash_error) end
            next_id = next_id + 1
            local record = { id = string.format("v%06d", next_id), hash = digest, state = "AVAILABLE",
                created = now(), activated = 0, expires = 0, revoked = 0 }
            records[#records + 1] = record
            generated[#generated + 1] = { record = record, token = token }
        end
        local saved, save_error = save_records(records)
        if not saved then error(save_error) end
        for _, item in ipairs(generated) do audit("generate", item.record, "digest-only-storage") end
        return generated
    end)
    if not result then return fail(error_message or "generation failed", json) end
    if json then
        local items = {}
        for _, item in ipairs(result) do items[#items + 1] = record_json(item.record, item.token) end
        print_json('{"ok":true,"duration":' .. DURATION .. ',"vouchers":[' .. table.concat(items, ",") .. "]}")
    else
        for _, item in ipairs(result) do print(item.token .. "\t" .. item.record.id) end
    end
    return true
end

local function action_reconcile(json)
    local changed, error_message = with_lock(function()
        local records = load_records()
        local dirty = reconcile(records)
        if dirty then
            local saved, save_error = save_records(records)
            if not saved then error(save_error) end
        end
        return dirty
    end)
    if changed == nil then return fail(error_message or "reconciliation failed", json) end
    if json then print_json('{"ok":true,"changed":' .. (changed and "true" or "false") .. "}") end
    return true
end

local function action_list(json)
    local records = load_records()
    reconcile(records)
    if json then
        local items = {}
        for _, record in ipairs(records) do items[#items + 1] = record_json(record) end
        print_json('{"ok":true,"duration":' .. DURATION .. ',"vouchers":[' .. table.concat(items, ",") .. "]}")
    else
        print("id\tstate\tcreated\tactivated\texpires\trevoked")
        for _, record in ipairs(records) do
            print(table.concat({ record.id, record.state, record.created, record.activated, record.expires, record.revoked }, "\t"))
        end
    end
    return true
end

local function find_record(records, value)
    local normalized = normalize(value)
    local digest = normalized and sha256(normalized) or nil
    for _, record in ipairs(records) do
        if record.id == value or (digest and record.hash == digest) then return record end
    end
    return nil
end

local function action_activate(value, json)
    if not normalize(value) then return fail("invalid voucher format", json) end
    local result, error_message = with_lock(function()
        local records = load_records()
        reconcile(records)
        local record = find_record(records, value)
        if not record then error("voucher not found") end
        if record.state ~= "AVAILABLE" then error("voucher is " .. record.state) end
        record.state = "ACTIVE"
        record.activated = now()
        record.expires = record.activated + DURATION
        local saved, save_error = save_records(records)
        if not saved then error(save_error) end
        audit("activate", record, "atomic-consume")
        return record
    end)
    if not result then return fail(error_message or "activation failed", json) end
    if json then print_json('{"ok":true,"duration":' .. DURATION .. ',"voucher":' .. record_json(result) .. "}")
    else print("OK\t" .. result.id .. "\t" .. result.state .. "\t" .. result.expires) end
    return true
end

local function action_revoke(value, json)
    local result, error_message = with_lock(function()
        local records = load_records()
        reconcile(records)
        local record = find_record(records, value)
        if not record then error("voucher not found") end
        if record.state == "EXPIRED" or record.state == "REVOKED" then error("voucher is " .. record.state) end
        record.state = "REVOKED"
        record.revoked = now()
        local saved, save_error = save_records(records)
        if not saved then error(save_error) end
        audit("revoke", record, "operator")
        return record
    end)
    if not result then return fail(error_message or "revocation failed", json) end
    if json then print_json('{"ok":true,"voucher":' .. record_json(result) .. "}")
    else print("OK\t" .. result.id .. "\tREVOKED") end
    return true
end

local function action_status(json)
    local records = load_records()
    reconcile(records)
    local counts = { AVAILABLE = 0, ACTIVE = 0, EXPIRED = 0, REVOKED = 0 }
    local active_until = 0
    for _, record in ipairs(records) do
        counts[record.state] = (counts[record.state] or 0) + 1
        if record.state == "ACTIVE" and record.expires > active_until then active_until = record.expires end
    end
    if json then
        print_json(string.format('{"ok":true,"duration":%d,"total":%d,"available":%d,"active":%d,"expired":%d,"revoked":%d,"active_until":%d}',
            DURATION, #records, counts.AVAILABLE, counts.ACTIVE, counts.EXPIRED, counts.REVOKED, active_until))
    else
        print(string.format("duration=%d total=%d available=%d active=%d expired=%d revoked=%d active_until=%d",
            DURATION, #records, counts.AVAILABLE, counts.ACTIVE, counts.EXPIRED, counts.REVOKED, active_until))
    end
    return true
end

local command = arg[1] or "status"
local json = false
for i = 2, #arg do
    if arg[i] == "--json" then json = true end
end
if command == "--json" then json = true; command = arg[2] or "status" end

if command == "generate" then
    os.exit(action_generate(arg[2] == "--json" and 1 or arg[2], json) and 0 or 1)
elseif command == "list" then
    os.exit(action_list(json) and 0 or 1)
elseif command == "status" then
    os.exit(action_status(json) and 0 or 1)
elseif command == "reconcile" then
    os.exit(action_reconcile(json) and 0 or 1)
elseif command == "activate" then
    os.exit(action_activate(arg[2], json) and 0 or 1)
elseif command == "revoke" then
    os.exit(action_revoke(arg[2], json) and 0 or 1)
else
    os.exit(fail("unknown command", json) and 0 or 1)
end
