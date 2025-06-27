# Update Background Images

After generating the AI images, replace the Unsplash URLs in the CSS with local paths:

```css
.svg-pattern-circuit {
  background-image: url('/images/backgrounds/circuit-board.png');
}

.svg-pattern-neural {
  background-image: url('/images/backgrounds/neural-network.png');
}

.svg-pattern-grid {
  background-image: url('/images/backgrounds/geometric-grid.png');
}

.svg-pattern-flow {
  background-image: url('/images/backgrounds/data-flow.png');
}
```

This file is in: `src/templates/layouts/admin-layout-v2.template.ts` around lines 206-236.