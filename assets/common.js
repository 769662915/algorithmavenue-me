// 统一的 Tailwind 配置
if (window.tailwind) {
    window.tailwind.config = {
        theme: {
            extend: {
                colors: {
                    // 统一使用首页的配色方案 (红色系主调)
                    primary: '#E63946', 
                    secondary: '#457B9D',
                    tertiary: '#1D3557',
                    dark: '#0F172A',
                    light: '#F1FAEE',
                    
                    // 兼容旧页面的颜色命名，映射到新的统一色板
                    accent: '#457B9D', // 对应 secondary
                    neutral: '#F1FAEE', // 对应 light
                    'neutral-dark': '#1D3557', // 对应 tertiary
                },
                fontFamily: {
                    sans: ['Inter', 'system-ui', 'sans-serif'],
                    display: ['Playfair Display', 'serif']
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
