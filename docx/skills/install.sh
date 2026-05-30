#!/bin/bash
# 将 skills 安装到 .claude/skills/ 目录
# 使用方法：在项目根目录执行 bash docx/skills/install.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET_DIR="$(pwd)/.claude/skills"

echo "安装 AIMemo Skills..."
echo "源目录: $SCRIPT_DIR"
echo "目标目录: $TARGET_DIR"

# 创建目标目录
mkdir -p "$TARGET_DIR"

# 复制 skills
for skill_dir in "$SCRIPT_DIR"/*/; do
  if [ -d "$skill_dir" ] && [ -f "$skill_dir/SKILL.md" ]; then
    skill_name=$(basename "$skill_dir")
    echo "  安装 skill: $skill_name"
    cp -r "$skill_dir" "$TARGET_DIR/$skill_name"
  fi
done

echo ""
echo "安装完成！已安装的 skills："
ls "$TARGET_DIR"
echo ""
echo "使用方式："
echo "  /dev-workflow    - 开发工作流规范（文件创建、代码风格、commit）"
echo "  /code-review     - 代码审查（安全、性能、规范检查）"
echo "  /testing         - 测试规范（单元测试、mock、数据库测试）"
echo "  /ui-patterns     - UI 模式（错误展示、状态管理、通用交互）"
echo "  /task-planning   - 需求拆解（写方案、拆 commit、审查、修正）"
