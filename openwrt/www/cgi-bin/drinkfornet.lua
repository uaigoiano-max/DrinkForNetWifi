#!/usr/bin/lua
-- Admin-only CGI boundary. Keep this endpoint on the management network.

local CORE = os.getenv("DRINKFORNET_CORE") or "/usr/libexec/drinkfornet-core.lua"
local TOKEN_FILE = os.getenv("DRINKFORNET_ADMIN_TOKEN_FILE") or "/etc/drinkfornet/admin.token"

local function json_escape(value)
    return tostring(value or ""):gsub("\\", "\\\\"):gsub('"', '\\"'):gsub("\n", "\\n"):gsub("\r", "\\r")
end
local function response(code, body)
    print("Status: " .. code)
    print("Content-Type: application/json")
    print("Cache-Control: no-store")
    print("")
    print(body)
end
local function shell_quote(value)
    return "'" .. tostring(value):gsub("'", "'\"'\"'") .. "'"
end
local function read_file(path)
    local file = io.open(path, "r")
    if not file then return nil end
    local value = file:read("*a") or ""
    file:close()
    return value:gsub("%s+$", "")
end
local function constant_time_equal(a, b)
    if not a or not b or #a ~= #b then return false end
    local different = 0
    for i = 1, #a do if a:sub(i, i) ~= b:sub(i, i) then different = different + 1 end end
    return different == 0
end

local configured = read_file(TOKEN_FILE)
if not configured or configured == "" then
    response("503 Service Unavailable", '{"ok":false,"error":"admin token is not configured"}')
    os.exit(1)
end
if not constant_time_equal(configured, os.getenv("HTTP_X_DRINKFORNET_ADMIN") or "") then
    response("401 Unauthorized", '{"ok":false,"error":"admin authentication required"}')
    os.exit(1)
end

local function decode(value)
    return (value or ""):gsub("+", " "):gsub("%%(%x%x)", function(hex) return string.char(tonumber(hex, 16)) end)
end
local params = {}
local function parse(encoded)
    for pair in (encoded or ""):gmatch("[^&]+") do
        local key, value = pair:match("^([^=]*)=(.*)$")
        if key then params[decode(key)] = decode(value) end
    end
end
parse(os.getenv("QUERY_STRING") or "")
local length = tonumber(os.getenv("CONTENT_LENGTH") or "0") or 0
if length > 0 and length < 4096 then parse(io.read(length) or "") end

local action = params.action or "status"
local allowed = { status = true, vouchers = true, generate = true, revoke = true, reconcile = true }
if not allowed[action] then
    response("400 Bad Request", '{"ok":false,"error":"unknown action"}')
    os.exit(1)
end
local command = action == "vouchers" and "list" or action
local argument = ""
if action == "generate" then
    local count = tonumber(params.count or "1") or 0
    if count < 1 or count > 100 or count % 1 ~= 0 then
        response("400 Bad Request", '{"ok":false,"error":"count must be from 1 to 100"}')
        os.exit(1)
    end
    argument = " " .. tostring(count)
elseif action == "revoke" then
    if not params.id or #params.id > 80 then
        response("400 Bad Request", '{"ok":false,"error":"voucher id is required"}')
        os.exit(1)
    end
    argument = " " .. shell_quote(params.id)
end
local command_line = "lua " .. shell_quote(CORE) .. " " .. shell_quote(command) .. argument .. " --json 2>&1"
local pipe = io.popen(command_line, "r")
local body = pipe and pipe:read("*a") or ""
if pipe then pipe:close() end
if body == "" then body = '{"ok":false,"error":"core unavailable"}' end
body = body:gsub("%s+$", "")
print("Content-Type: application/json")
print("Cache-Control: no-store")
print("")
print(body)
