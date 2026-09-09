# Contributing to Edge Context Router

Thank you for contributing to **Edge Context Router**, a speculative semantic execution router that dynamically routes tasks between local quantised models and cloud LLMs via embedding cosine similarity.

## Setup & Testing

```bash
npm install
npx vitest run
```

### Architecture

- **Local Semantic Embeddings**: Utilizes `@xenova/transformers` (`all-MiniLM-L6-v2`) in ONNX format to compute cosine similarity against semantic task anchors.
- **Routing Policy**: Low-latency tasks are dispatched to local edge models; high-complexity tasks are routed to cloud models.

## How to Submit Changes

1. Fork the repo and create a feature branch (`git checkout -b feat/my-router-feature`).
2. Run tests with `npx vitest run`.
3. Open a Pull Request.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
