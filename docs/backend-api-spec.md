# API Specification - Route Builder

Esta especificação define os endpoints necessários para criar paragens e linhas de táxi.

## Base URL
```
/rotas
```

---

## 1. Criar Paragem

**Endpoint**: `POST /rotas/paragem`

**Request Body**:
```json
{
  "nome": "Mutamba",
  "latitude": -8.8382,
  "longitude": 13.2344
}
```

**Response (Success - 201)**:
```json
{
  "sucesso": true,
  "dados": {
    "id": 42,
    "nome": "Mutamba",
    "latitude": -8.8382,
    "longitude": 13.2344
  }
}
```

**Response (Error - 400)**:
```json
{
  "sucesso": false,
  "erro": "Nome da paragem é obrigatório"
}
```

---

## 2. Criar Linha

**Endpoint**: `POST /rotas/linha`

**Request Body**:
```json
{
  "nome": "Linha 15",
  "descricao": "Mutamba - Viana",
  "paragemIds": [1, 5, 12, 23, 42]
}
```

> **Nota**: `paragemIds` é um array ordenado com os IDs das paragens que compõem a linha, na ordem do percurso.

**Response (Success - 201)**:
```json
{
  "sucesso": true,
  "dados": {
    "id": 8,
    "nome": "Linha 15",
    "descricao": "Mutamba - Viana",
    "percurso": [
      { "id": 1, "nome": "Mutamba", "latitude": -8.8382, "longitude": 13.2344 },
      { "id": 5, "nome": "Largo 1 Maio", "latitude": -8.8401, "longitude": 13.2356 },
      ...
    ]
  }
}
```

**Response (Error - 400)**:
```json
{
  "sucesso": false,
  "erro": "Linha deve ter pelo menos 2 paragens"
}
```

---

## 3. Actualizar Paragem (Opcional)

**Endpoint**: `PUT /rotas/paragem/:id`

**Request Body**:
```json
{
  "nome": "Novo Nome",
  "latitude": -8.8400,
  "longitude": 13.2350
}
```

---

## 4. Eliminar Paragem (Opcional)

**Endpoint**: `DELETE /rotas/paragem/:id`

**Response (Success - 200)**:
```json
{
  "sucesso": true,
  "mensagem": "Paragem eliminada"
}
```

---

## Validações Recomendadas

| Campo | Validação |
|-------|-----------|
| `nome` | Obrigatório, string, 1-100 caracteres |
| `latitude` | Obrigatório, número, -90 a 90 |
| `longitude` | Obrigatório, número, -180 a 180 |
| `paragemIds` | Array de inteiros, mínimo 2 elementos |

---

## Exemplo de Controlador (Java/Spring)

```java
@PostMapping("/paragem")
public ResponseEntity<?> criarParagem(@RequestBody ParagemDTO dto) {
    Paragem paragem = new Paragem();
    paragem.setNome(dto.getNome());
    paragem.setLatitude(dto.getLatitude());
    paragem.setLongitude(dto.getLongitude());
    
    Paragem saved = paragensRepository.save(paragem);
    
    return ResponseEntity.status(201).body(Map.of(
        "sucesso", true,
        "dados", saved
    ));
}

@PostMapping("/linha")
public ResponseEntity<?> criarLinha(@RequestBody LinhaDTO dto) {
    Linha linha = new Linha();
    linha.setNome(dto.getNome());
    linha.setDescricao(dto.getDescricao());
    
    List<Paragem> percurso = dto.getParagemIds().stream()
        .map(id -> paragensRepository.findById(id).orElseThrow())
        .collect(Collectors.toList());
    
    linha.setPercurso(percurso);
    Linha saved = linhasRepository.save(linha);
    
    return ResponseEntity.status(201).body(Map.of(
        "sucesso", true,
        "dados", saved
    ));
}
```
