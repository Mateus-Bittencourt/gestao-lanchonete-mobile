# Aplicativo de Gestão de Vendas e Estoque - Lanchonete

## Objetivo
Aplicativo mobile para microempreendimentos alimentícios permitindo:
- Registro rápido de vendas
- Controle de estoque com baixa automática
- Alertas de reordenação
- Relatórios semanais básicos

## Stack
- React Native (TypeScript)
- Arquitetura: Domain / UseCases / Data / UI (camada de navegação)
- Estado: React Hooks + Context API (pode evoluir para Zustand ou Redux se crescer)
- Persistência local: (Inicial) AsyncStorage (pode evoluir para SQLite ou MMKV)
- Futuro: Firebase Authentication + Firestore (sincronização)
- Testes: Jest + React Native Testing Library (a adicionar)
- Formatação e qualidade: ESLint + Prettier (a adicionar)

## Estrutura de Pastas
```
src/
 ├─ core/
 │   ├─ constants/
 │   └─ types/
 ├─ domain/
 │   ├─ models/
 │   ├─ repositories/
 │   └─ usecases/
 ├─ data/
 │   ├─ local/
 │   └─ repositories/
 ├─ navigation/
 ├─ screens/
 │   ├─ login/
 │   ├─ sales/
 │   ├─ inventory/
 │   └─ reports/
 ├─ components/
 └─ App.tsx
```

## Principais Casos de Uso
- RegisterSaleUseCase
- GetLowStockAlertsUseCase
- AdjustInventoryUseCase (futuro)
- GetWeeklyReportUseCase (placeholder)

## Roadmap Inicial
1. Estrutura base + modelos
2. Registro de vendas local
3. Controle de estoque + baixa automática
4. Alertas de estoque
5. Relatórios simples (agregação semanal)
6. Sincronização Firebase
7. Treinamento e documentação

## Como Executar
1. Instalar dependências: `npm install` ou `yarn`
2. Android: `npx react-native run-android`
3. iOS (macOS): `npx react-native run-ios`
4. Metro bundler: `npx react-native start`

## Configuração Firebase (futuro)
- Instalar pacotes `@react-native-firebase/app`, `auth`, `firestore`
- Criar arquivo de inicialização em `src/core/firebase/config.ts`

## Licença
Sem licença definida no momento.

## Contribuição
Abrir issues para melhorias (ex.: adicionar testes de estoque, refatorar persistência, CI etc.).