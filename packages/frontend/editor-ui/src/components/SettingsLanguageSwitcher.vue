<template>
	<div class="language-switcher">
		<el-dropdown @command="handleLanguageChange">
			<span class="el-dropdown-link">
				{{
					currentLanguage === 'en'
						? i18n.baseText('settings.language.english')
						: i18n.baseText('settings.language.chinese')
				}}
				<el-icon class="el-icon--right"><arrow-down /></el-icon>
			</span>
			<template #dropdown>
				<el-dropdown-menu>
					<el-dropdown-item command="en">{{
						i18n.baseText('settings.language.english')
					}}</el-dropdown-item>
					<el-dropdown-item command="zh">{{
						i18n.baseText('settings.language.chinese')
					}}</el-dropdown-item>
				</el-dropdown-menu>
			</template>
		</el-dropdown>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ArrowDown } from '@element-plus/icons-vue';
import { loadLanguage } from '@/plugins/i18n';
import { useI18n } from '@/composables/useI18n';

const i18n = useI18n();
const currentLanguage = ref('en');

async function handleLanguageChange(lang: string) {
	try {
		await loadLanguage(lang);
		currentLanguage.value = lang;
		// Store the language preference in localStorage
		localStorage.setItem('n8n-language', lang);
		window.location.reload();
	} catch (error) {
		console.error('Failed to change language:', error);
	}
}

onMounted(() => {
	// Get the language preference from localStorage or use the default
	const savedLanguage = localStorage.getItem('n8n-language') || 'en';
	currentLanguage.value = savedLanguage;
	if (savedLanguage !== 'en') {
		loadLanguage(savedLanguage);
	}
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
