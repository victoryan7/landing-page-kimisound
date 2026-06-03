# KimiSound — Brand Guidelines

## Paleta de Cores (Dark Theme — Primário)

| Token | Hex | Uso |
|-------|-----|-----|
| Background | `#0F1117` | Fundo principal |
| Surface | `#181C25` | Cards, modais |
| Surface Light | `#1E2330` | Elementos elevados |
| Border | `#2A3042` | Bordas sutis |
| Text Primary | `#F5F7FA` | Títulos e texto principal |
| Text Secondary | `#9AA4B2` | Texto de suporte |
| **Cyan (Accent)** | `#00C2FF` | CTAs, highlights, glow principal |
| **Purple** | `#7B61FF` | Gradientes, destaques secundários |
| Orange (Logo) | `#E8430A` | Apenas "Sound" no logotipo |
| Success | `#00D084` | Flow Score verde |
| Warning | `#F59E0B` | Flow Score amarelo |
| Error | `#EF4444` | Flow Score vermelho |

## Gradiente Assinatura

```css
background: linear-gradient(135deg, #00C2FF 0%, #7B61FF 100%);
```

## Efeitos Visuais

```css
/* Glassmorphism */
background: rgba(24, 28, 37, 0.7);
backdrop-filter: blur(20px);
border: 1px solid rgba(42, 48, 66, 0.5);

/* Glow Cyan */
box-shadow: 0 0 40px rgba(0, 194, 255, 0.15);

/* Glow intenso (hover / destaque) */
box-shadow: 0 0 80px rgba(0, 194, 255, 0.3), 0 0 40px rgba(123, 97, 255, 0.2);

/* Grid overlay de fundo */
background-image: linear-gradient(rgba(42,48,66,0.03) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(42,48,66,0.03) 1px, transparent 1px);
background-size: 60px 60px;
```

## Tipografia

| Uso | Fonte | Peso |
|-----|-------|------|
| Headlines | Poppins | 800 (ExtraBold) |
| Subheadings | Inter | 600 (SemiBold) |
| Body | Inter | 400 (Regular) |
| Métricas/código | JetBrains Mono | 500 (Medium) |

**Google Fonts URL:**
```
https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@500;600&family=Poppins:wght@400;600;700;800&display=swap
```

## Logotipo

- Nome: **KimiSound**
- "Kimi" em `#00C2FF` (cyan) ou `#F5F7FA` (branco)
- "Sound" sempre em `#E8430A` (laranja)
- Peso: Poppins 800 ou Gotham Bold

## Border Radius

| Contexto | Valor |
|----------|-------|
| Pequeno (badges, chips) | `5px` |
| Médio (inputs, botões sm) | `8px` |
| Grande (cards, modais) | `12px` |
| XL (containers principais) | `16px` |
| Circular | `50%` |

## Mood Reference

**NASA mission control meets underground techno rave.**
- Escuro, preciso, premium
- Neon glows contidos (não excessivos)
- Animações suaves e deliberadas
- Sensação de tecnologia avançada e confiável
