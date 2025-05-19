<template>
	<div class="language-switcher">
		<el-dropdown @command="handleLanguageChange">
			<span class="el-dropdown-link">
				{{ currentLanguage === 'en' ? 'English' : '中文' }}
				<el-icon class="el-icon--right"><arrow-down /></el-icon>
			</span>
			<template #dropdown>
				<el-dropdown-menu>
					<el-dropdown-item command="en">English</el-dropdown-item>
					<el-dropdown-item command="zh">中文</el-dropdown-item>
				</el-dropdown-menu>
			</template>
		</el-dropdown>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ArrowDown } from '@element-plus/icons-vue';
import { loadLanguage } from '@/plugins/i18n';
export default defineComponent({
	name: 'LanguageSwitcher',
	components: {
		ArrowDown,
	},
	data() {
		return {
			currentLanguage: 'en',
		};
	},
	methods: {
		async handleLanguageChange(lang: string) {
			try {
				await loadLanguage(lang);
				this.currentLanguage = lang;
				// Store the language preference in localStorage
				localStorage.setItem('n8n-language', lang);
				window.location.reload();
			} catch (error) {
				console.error('Failed to change language:', error);
			}
		},
	},
	mounted() {
		// Get the language preference from localStorage or use the default
		const savedLanguage = localStorage.getItem('n8n-language') || 'en';
		this.currentLanguage = savedLanguage;
		if (savedLanguage !== 'en') {
			loadLanguage(savedLanguage);
		}
	},
});
</script>

<style scoped>
.language-switcher {
	display: inline-block;
	margin: 0 10px;
}

.el-dropdown-link {
	cursor: pointer;
	display: flex;
	align-items: center;
	color: var(--color-text-base);
}

.el-dropdown-link:hover {
	color: var(--color-primary);
}
</style>
