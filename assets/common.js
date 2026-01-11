// 统一的 Tailwind 配置
if (window.tailwind) {
    window.tailwind.config = {
        theme: {
            extend: {
                colors: {
                    // 全新配色方案：深色赛博朋克风 (Dark Cyberpunk)
                    primary: '#00ff9d',    // 霓虹绿：强调色
                    secondary: '#ff0055',  // 霓虹红：次要强调
                    tertiary: '#1a1a1a',   // 深灰：卡片背景
                    dark: '#121212',       // 极黑：页面背景
                    light: '#e0e0e0',      // 亮灰：主要文字
                    
                    // 兼容映射
                    accent: '#ff0055',     // 对应 secondary
                    neutral: '#1a1a1a',    // 对应 tertiary (背景)
                    'neutral-dark': '#000000', // 更深的背景
                    
                    // 额外颜色
                    'surface': '#2d2d2d',  // 表面色
                    'muted': '#888888'     // 柔和文字
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
            isMenuOpen: false
        };
    },
    methods: {
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
