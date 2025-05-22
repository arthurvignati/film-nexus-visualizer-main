# Projeto GRAFOS
# 🎬 Cinema Explorer - Visualização de Filmes em Grafo
 
# 🧑 Arthur Vignati Moscardi - 10409688 || Pedro Pessuto - 10409729 || Ian da Cunha - 10409669 || Enzo Bernal - 10402685 || Davi Martins - 10374878

## 📋 Sobre o Projeto

O Cinema Explorer é uma aplicação web interativa que visualiza relações entre filmes usando estruturas de grafos. Ela permite aos usuários explorar filmes, descobrir recomendações e analisar suas conexões através de visualizações gráficas e algoritmos avançados de teoria dos grafos.

## 🎯 Funcionalidades

### 📊 Visualização de Grafo
- **Nós**: Cada filme é representado por um nó no grafo
- **Arestas**: Conectam filmes que compartilham gêneros em comum
- **Pesos**: O peso das arestas é determinado pelo número de gêneros em comum
- **Interatividade**: Arraste, zoom e seleção de nós para análise detalhada

### 🔍 Exploração de Filmes
- Busca por título, gênero, ano e classificação
- Seleção múltipla de filmes para análise comparativa
- Recomendações baseadas em similaridade de gêneros

### 📈 Análise de Grafos
- **Informações Básicas**: Conectividade, número de nós e arestas
- **Algoritmos de Travessia**:
  - Busca em Profundidade (DFS) - explora até o fim de cada ramo
  - Busca em Largura (BFS) - explora todos os vizinhos antes de avançar
- **Caminhos Mais Curtos**: Algoritmo de Dijkstra para encontrar o caminho mais eficiente entre dois filmes
- **Árvore Geradora Mínima**: Algoritmo de Kruskal para conexões essenciais
- **Análise de Componentes**: Identificação de grupos conectados no grafo

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React**: Biblioteca JavaScript para construção de interfaces
- **TypeScript**: Tipagem estática para desenvolvimento mais robusto
- **Tailwind CSS**: Framework de CSS utilitário
- **Shadcn/UI**: Componentes reutilizáveis

### Visualização de Grafos
- **XYFlow (React Flow)**: Biblioteca para renderização e manipulação de grafos
- **Algoritmos de Teoria dos Grafos**: Implementações de DFS, BFS, Dijkstra e Kruskal

### Gerenciamento de Estado
- **React Query**: Busca, cache e atualização de dados com estado

## 📝 Como Funciona

### Estrutura de Dados do Grafo
- **WeightedAdjList**: Lista de adjacência com pesos para representação eficiente do grafo
- **Nós**: Representam filmes com seus metadados
- **Arestas**: Conexões entre filmes com pesos baseados em gêneros compartilhados

### Análise de Similaridade
- Os filmes são conectados quando compartilham gêneros
- O peso da conexão é determinado pelo número de gêneros em comum
- Filmes com mais gêneros compartilhados possuem conexões mais fortes

### Algoritmos Implementados
1. **DFS (Depth-First Search)**: Explora um caminho até seu fim antes de retroceder
2. **BFS (Breadth-First Search)**: Explora todos os vizinhos antes de avançar na profundidade
3. **Dijkstra**: Encontra o caminho mais curto entre dois filmes
4. **Kruskal**: Constrói uma árvore geradora mínima do grafo
5. **Detecção de Componentes**: Identifica subgrupos conectados no grafo

## 🚀 Como Utilizar

1. **Busca de Filmes**: Use a barra de busca para encontrar filmes por título
2. **Seleção**: Clique nos filmes para adicioná-los ao grafo
3. **Exploração**: Interaja com o grafo para reorganizar, aproximar ou afastar a visualização
4. **Análise**: Utilize o painel de análise para aplicar algoritmos e obter insights
5. **Recomendações**: Descubra novos filmes baseados nas suas seleções

## 🧪 Algoritmos em Ação

### Caminho Mais Curto
Encontre a "distância" entre dois filmes no grafo, mostrando a sequência de filmes relacionados que os conectam da maneira mais eficiente.

### Árvore Geradora Mínima
Visualize as conexões mais essenciais entre todos os filmes selecionados, formando uma estrutura que conecta todos os nós sem ciclos e com peso mínimo.

### Componentes Conectados
Descubra grupos de filmes que formam "ilhas" conectadas no grafo, ajudando a identificar clusters de filmes similares.

## 📊 Visualização de Dados

O projeto implementa visualizações interativas que permitem:

- Ver claramente os pesos das arestas no grafo
- Destacar filmes selecionados e suas recomendações
- Acompanhar visualmente os resultados dos algoritmos
- Obter detalhes sobre filmes específicos ao selecioná-los

## 🔮 Possibilidades Futuras

- Implementação de algoritmos adicionais (PageRank, Centralidade)
- Melhoria na detecção de similaridade (análise de sinopse, diretores, atores)
- Expansão para séries de TV e outros tipos de mídia
- Integração com APIs externas para dados atualizados

## 📚 Fundamentação Teórica

Este projeto aplica conceitos fundamentais da Teoria dos Grafos:
- **Grafos ponderados não-direcionados**: Representam relações simétricas entre filmes
- **Caminhos mais curtos**: Encontram a "distância" mínima entre dois nós
- **Árvores geradoras**: Conectam todos os nós sem criar ciclos
- **Componentes conectados**: Identificam subgrafos isolados

---

🎓 Desenvolvido como projeto educacional para aplicação de conceitos de Teoria dos Grafos em uma interface interativa e intuitiva.
