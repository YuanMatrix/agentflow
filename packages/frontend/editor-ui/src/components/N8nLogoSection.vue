<script setup lang="ts">
import { computed } from 'vue';
import LogoIcon from './Logo/logo-icon.svg';
import LogoText from './Logo/logo-text.svg';
import { N8nNavigationDropdown, N8nIconButton } from '@n8n/design-system';

const props = defineProps<{
	collapsed?: boolean;
	menu: any[];
}>();

const emit = defineEmits<{
	(event: 'select', value: string): void;
}>();

const showLogoText = computed(() => !props.collapsed);
const showLogoSection = computed(() => !props.collapsed);

const handleMenuSelect = (value: string) => {
	emit('select', value);
};
</script>

<template>
	<div :class="[$style.container, { [$style.collapsed]: props.collapsed }]">
		<div v-if="showLogoSection" :class="$style.logoSection">
			<LogoIcon :class="$style.logo" />
			<LogoText v-if="showLogoText" :class="$style.logoText" />
		</div>
		<N8nNavigationDropdown data-test-id="universal-add" :menu="menu" @select="handleMenuSelect">
			<N8nIconButton icon="plus" type="secondary" outline />
		</N8nNavigationDropdown>
	</div>
</template>

<style lang="scss" module>
.container {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	padding: var(--spacing-xs);
	gap: var(--spacing-s);

	&.collapsed {
		padding: var(--spacing-2xs);
	}
}

.logoSection {
	display: flex;
	align-items: center;
}

.logo {
	transform: scale(1.3);
}

.logoText {
	transform: scale(1.3);
	margin-left: var(--spacing-xs);
	margin-right: var(--spacing-3xs);
	path {
		fill: var(--color-text-dark);
	}
}
</style>
