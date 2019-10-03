## 持续集成

### Travis CI

要在Travis Ci测试项目，如下是示例`.travis.yml`文件：

```yaml
language: rust
rust:
  - stable
  - beta
  - nightly
matrix:
  allow_failures:
    - rust: nightly
```

这将会测试所有三个发布通道，但是任何nightly构建中断将不会使整体构建失败。请参考[Travis CI Rust
documentation](https://docs.travis-ci.com/user/languages/rust/)获取更多信息。

### GitLab CI

要在GitLab CI测试项目，如下是示例`.gitlab-ci.yml`文件：

```yaml
stages:
  - build

rust-latest:
  stage: build
  image: rust:latest
  script:
    - cargo build --verbose
    - cargo test --verbose

rust-nightly:
  stage: build
  image: rustlang/rust:nightly
  script:
    - cargo build --verbose
    - cargo test --verbose
  allow_failure: true
```

这会在stable通道和nightly通道测试，但是任何nightly构建中断将不会使整体构建失败。请参考[GitLab CI](https://docs.gitlab.com/ce/ci/yaml/README.html)获取更多信息。

### builds.sr.ht

要在sr.ht测试项目，如下是示例.build.yml文件。确保将`<your repo>`和`<your project>`改变为要克隆和已克隆的目录。

```yaml
image: archlinux
packages:
  - rustup
sources:
  - <your repo>
tasks:
  - setup: |
      rustup toolchain install nightly stable
      cd <your project>/
      rustup run stable cargo fetch
  - stable: |
      rustup default stable
      cd <your project>/
      cargo build --verbose
      cargo test --verbose
  - nightly: |
      rustup default nightly
      cd <your project>/
      cargo build --verbose ||:
      cargo test --verbose  ||:
  - docs: |
      cd <your project>/
      rustup run stable cargo doc --no-deps
      rustup run nightly cargo doc --no-deps ||:
```

这将会在stable和nightly通道测试和构建文档，但是任何nightly构建中断将不会使整体构建失败。请参考[builds.sr.ht documentation](https://man.sr.ht/builds.sr.ht/)获取更多信息。
