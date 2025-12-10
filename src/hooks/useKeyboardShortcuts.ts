'use client';

import { useEffect, useCallback } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: KeyHandler;
  description?: string;
}

interface ShortcutDefinition {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
}

export function useKeyboardShortcut(config: ShortcutConfig) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, ctrl, shift, alt, meta, handler } = config;

      // 检查修饰键
      const ctrlMatch = ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
      const shiftMatch = shift ? event.shiftKey : !event.shiftKey;
      const altMatch = alt ? event.altKey : !event.altKey;

      // 检查按键
      const keyMatch = event.key.toLowerCase() === key.toLowerCase();

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        // 忽略输入框中的快捷键
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }

        event.preventDefault();
        handler(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config]);
}

// 多个快捷键
export function useKeyboardShortcuts(configs: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 忽略输入框中的快捷键
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      for (const config of configs) {
        const { key, ctrl, shift, alt, handler } = config;

        const ctrlMatch = ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shift ? event.shiftKey : !event.shiftKey;
        const altMatch = alt ? event.altKey : !event.altKey;
        const keyMatch = event.key.toLowerCase() === key.toLowerCase();

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          handler(event);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [configs]);
}

// 常用快捷键配置
export const COMMON_SHORTCUTS: Record<string, ShortcutDefinition> = {
  // 导航
  goHome: { key: 'h', alt: true, description: '返回首页' },
  goCreate: { key: 'n', ctrl: true, description: '新建模型' },
  goDashboard: { key: 'd', alt: true, description: '打开控制台' },
  goSettings: { key: ',', ctrl: true, description: '打开设置' },
  
  // 操作
  save: { key: 's', ctrl: true, description: '保存' },
  search: { key: 'k', ctrl: true, description: '搜索' },
  escape: { key: 'Escape', description: '关闭/取消' },
  
  // 语言
  toggleLanguage: { key: 'l', alt: true, description: '切换语言' },
};

// 快捷键帮助面板 Hook
export function useShortcutHelp() {
  const showHelp = useCallback(() => {
    // 可以触发一个模态框显示所有快捷键
    console.log('Keyboard Shortcuts:');
    Object.entries(COMMON_SHORTCUTS).forEach(([, config]) => {
      const keys: string[] = [];
      if (config.ctrl) keys.push('Ctrl');
      if (config.alt) keys.push('Alt');
      if (config.shift) keys.push('Shift');
      keys.push(config.key.toUpperCase());
      console.log(`${keys.join('+')} - ${config.description}`);
    });
  }, []);

  useKeyboardShortcut({
    key: '/',
    ctrl: true,
    handler: showHelp,
    description: '显示快捷键帮助',
  });

  return { showHelp };
}
