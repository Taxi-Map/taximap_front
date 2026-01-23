# backend rotas

http://localhost:3000/rotas/paragens

resposta:

{
  "sucesso": true,
  "dados": [
    {
      "id": 1,
      "nome": "Gamek Nosso Centro",
      "latitude": -8.884853960185831,
      "longitude": 13.207005333521257
    },
    {
      "id": 2,
      "nome": "Aeroporto",
      "latitude": -8.846019570873045,
      "longitude": 13.233399825980307
    },
    {
      "id": 3,
      "nome": "Vila do Gamek",
      "latitude": -8.89841681923556,
      "longitude": 13.214259802237525
    }
  ]
}

http://localhost:3000/rotas/paragem?id=1

resposta:
{
  "sucesso": true,
  "dados": {
    "id": 1,
    "nome": "Gamek Nosso Centro",
    "latitude": -8.884853960185831,
    "longitude": 13.207005333521257
  }
}

http://localhost:3000/rotas/caminho-mais-curto?origem=1&destino=2

resposta:
{
  "sucesso": true,
  "dados": {
    "paragens": [
      {
        "id": 1,
        "nome": "Gamek Nosso Centro",
        "latitude": -8.884853960185831,
        "longitude": 13.207005333521257
      },
      {
        "id": 2,
        "nome": "Aeroporto",
        "latitude": -8.846019570873045,
        "longitude": 13.233399825980307
      }
    ],
    "linhas": [
      "Aeroporto-Gamek Nosso Centro"
    ],
    "distanciaTotal": 5.201536838829414,
    "numeroParagens": 2
  }
}