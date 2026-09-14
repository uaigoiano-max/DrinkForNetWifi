# Hardware recomendado

Esta lista é uma referência para montar uma operação portátil. Os links podem ser afiliados; quando forem, isso será informado junto ao produto. Preços, estoque, vendedores e especificações podem mudar.

## Roteador: Cudy TR1200

O Cudy TR1200 é uma opção compacta para prototipagem e eventos pequenos, com Wi-Fi 5 AC1200, modos de viagem, WAN, LAN e alimentação USB-C.

[Ver o Cudy TR1200 na Amazon](https://link.amazon/B09nTMBi1)

![Roteador Cudy TR1200](hardware/cudy-tr1200.png)

> Este é um link de afiliado da Amazon. Se você comprar por ele, posso receber uma comissão sem custo adicional para você.

O roteador não garante vouchers ou captive portal sozinho. Esta referência não
alega compatibilidade com OpenNDS, NoDogSplash, firmware Cudy ou com o núcleo
local deste repositório. A validação física está pendente para a revisão exata
do TR1200 e o firmware que será usado no evento.

## Powerbank: Anker Laptop Power Bank 25.000 mAh

O Anker de 25.000 mAh e até 165 W é uma opção premium para alimentar o roteador e recarregar outros acessórios.

[Ver o powerbank Anker na Amazon](https://link.amazon/B07Syolji)

![Powerbank Anker de 25.000 mAh](hardware/anker-165w-powerbank.png)

> Este é um link de afiliado da Amazon. Se você comprar por ele, posso receber uma comissão sem custo adicional para você.

### Uso com o Cudy

1. Confirme no manual ou na etiqueta do Cudy a tensão aceita na entrada USB-C.
2. Para o primeiro teste, prefira a saída USB-A de 5 V do powerbank com um cabo USB-A para USB-C.
3. Ligue o roteador e teste a rede por algumas horas com vários celulares.
4. Verifique reinicializações, aquecimento, perda de conexão e desligamento automático do powerbank.
5. A saída USB-C pode funcionar, mas depende da negociação USB Power Delivery.

Não force 9 V, 12 V, 15 V ou 20 V na entrada do roteador. A combinação é compatível em princípio, mas deve ser validada com o lote e o firmware usados antes de uma operação pública.

## Cabos

| Uso | Recomendação |
| --- | --- |
| Primeiro teste do roteador | USB-A para USB-C, 1 m ou 1,5 m |
| USB-C Power Delivery | USB-C para USB-C de 100 W, após confirmar a tensão |
| Reserva para celulares | USB-C para USB-C de 60 W ou 100 W |

Prefira Anker, UGREEN ou Baseus, com conectores firmes, revestimento reforçado e potência claramente informada. Um cabo de 100 W não faz o roteador consumir mais; ele oferece margem e construção adequada. Não é necessário um cabo de 240 W para esta aplicação.

## Checklist

- [ ] Tensão de entrada do roteador confirmada.
- [ ] Cabo sem danos e com comprimento adequado.
- [ ] Teste prolongado concluído sem reinicialização.
- [ ] Powerbank sem aquecimento anormal.
- [ ] Powerbank não desliga por baixo consumo.
- [ ] Cabo reserva disponível.
- [ ] Captive portal testado com a alimentação escolhida.
