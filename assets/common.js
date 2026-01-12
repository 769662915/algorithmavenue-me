// 注入 CSS 变量
const style = document.createElement('style');
style.textContent = `
    :root {
        --color-primary: #00ff9d;
        --color-secondary: #ff0055;
        --color-tertiary: #1a1a1a;
        --color-dark: #121212;
        --color-light: #e0e0e0;
        --color-surface: #2d2d2d;
        --color-muted: #888888;
        --color-neutral-dark: #000000;
    }
    :root[data-theme="light"] {
        --color-primary: #059669;
        --color-secondary: #db2777;
        --color-tertiary: #f3f4f6;
        --color-dark: #ffffff;
        --color-light: #111827;
        --color-surface: #e5e7eb;
        --color-muted: #4b5563;
        --color-neutral-dark: #f9fafb;
    }
`;
document.head.appendChild(style);

// 统一的 Tailwind 配置
if (window.tailwind) {
    window.tailwind.config = {
        theme: {
            extend: {
                colors: {
                    // 全新配色方案：深色赛博朋克风 (Dark Cyberpunk) - 使用 CSS 变量支持切换
                    primary: 'var(--color-primary)',
                    secondary: 'var(--color-secondary)',
                    tertiary: 'var(--color-tertiary)',
                    dark: 'var(--color-dark)',
                    light: 'var(--color-light)',
                    
                    // 兼容映射
                    accent: 'var(--color-secondary)',
                    neutral: 'var(--color-tertiary)',
                    'neutral-dark': 'var(--color-neutral-dark)',
                    
                    // 额外颜色
                    'surface': 'var(--color-surface)',
                    'muted': 'var(--color-muted)'
                },
                fontFamily: {
                    sans: ['Courier New', 'Courier', 'monospace'], // 科技感等宽字体
                    display: ['Arial Black', 'Impact', 'sans-serif'] // 粗犷标题字体
                },
            }
        }
    };
}

// 通用 Vue Mixin
window.AppMixin = {
    data() {
        return {
            categories: [],
            searchQuery: '',
            loading: false,
            loadError: null,
            // 分页相关默认值
            currentPage: 1,
            pageSize: 6, // 首页是6，其他页可能是5，可在组件中覆盖
            isMenuOpen: false,
            isDark: true
        };
    },
    mounted() {
        // 初始化主题
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            this.setTheme(false);
        } else {
            this.setTheme(true);
        }
    },
    methods: {
        // 主题切换
        toggleTheme() {
            this.setTheme(!this.isDark);
        },
        setTheme(isDark) {
            this.isDark = isDark;
            if (isDark) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            }
        },
        // 加载分类数据
        getCategories() {
            fetch('assets/categories.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('网络响应不正常');
                    }
                    return response.json();
                })
                .then(data => {
                    this.categories = data;
                })
                .catch(error => {
                    console.error('获取分类失败:', error);
                });
        },
        // 通用跳转方法 (使用相对路径)
        goHome() {
            window.location.href = 'index.html';
        },
        toDetail(id) {
            window.location.href = `detail.html?id=${id}`;
        },
        toSearch() {
            window.location.href = `search.html?q=${encodeURIComponent(this.searchQuery)}`;
        },
        toggleMenu() {
            this.isMenuOpen = !this.isMenuOpen;
            document.body.style.overflow = this.isMenuOpen ? 'hidden' : 'auto';
        },
        // 获取 URL 参数
        getUrlParams() {
            const queryString = window.location.search;
            const params = new URLSearchParams(queryString);
            const paramObj = {};
            params.forEach((value, key) => {
                paramObj[key] = value;
            });
            return paramObj;
        },
        // 随机获取数组中的元素
        getUniqueRandomValues(arr, count) {
            if (!arr) return [];
            var copyArr = [...arr];
            var result = [];
            var take = Math.min(count, copyArr.length);
            for (let i = 0; i < take; i++) {
                var randomIndex = Math.floor(Math.random() * copyArr.length);
                result.push(copyArr.splice(randomIndex, 1)[0]);
            }
            return result;
        }
    }
};
