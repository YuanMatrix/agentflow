import type { RouteLocationNormalized } from 'vue-router';
import type { Resource } from '@n8n/permissions';
import type { INodePropertyOptions, INodeProperties } from 'n8n-workflow';
import { useUsersStore } from '@/stores/users.store';

export function inferProjectIdFromRoute(to: RouteLocationNormalized): string {
	const routeParts = to.path.split('/');
	const projectsIndex = routeParts.indexOf('projects');
	const projectIdIndex = projectsIndex !== -1 ? projectsIndex + 1 : -1;

	return routeParts[projectIdIndex];
}

export function inferResourceTypeFromRoute(to: RouteLocationNormalized): Resource | undefined {
	const routeParts = to.path.split('/');
	const routeMap: Record<string, string> = {
		workflow: 'workflows',
		credential: 'credentials',
		user: 'users',
		variable: 'variables',
		sourceControl: 'source-control',
		externalSecret: 'external-secrets',
	};

	const isResource = (key: string): key is Resource => routeParts.includes(routeMap[key]);

	for (const resource of Object.keys(routeMap)) {
		if (isResource(resource)) {
			return resource;
		}
	}

	return undefined;
}

export function inferResourceIdFromRoute(to: RouteLocationNormalized): string | undefined {
	return (to.params.id as string | undefined) ?? (to.params.name as string | undefined);
}

/**
 * Filter node operation options based on user role
 * Hide delete operations for member users in MongoDB and PostgreSQL nodes
 * This function filters both the operation options and their associated actions
 * to ensure member users cannot see or access delete functionality
 */
export function filterNodeOperationsByUserRole(
	nodeType: string,
	parameter: INodeProperties,
): INodeProperties {
	const usersStore = useUsersStore();
	const currentUser = usersStore.currentUser;

	// Only apply filtering to operation parameters
	if (parameter.name !== 'operation' || parameter.type !== 'options') {
		return parameter;
	}

	// Only apply to MongoDB and PostgreSQL nodes
	const restrictedNodeTypes = ['n8n-nodes-base.mongoDb', 'n8n-nodes-base.postgres'];
	if (!restrictedNodeTypes.includes(nodeType)) {
		return parameter;
	}

	// Only restrict for member users - owners and admins can see all operations
	if (!currentUser || currentUser.role !== 'global:member') {
		return parameter;
	}

	// Filter out delete operations for member users
	const filteredOptions = (parameter.options as INodePropertyOptions[]).filter((option) => {
		// For MongoDB: hide 'delete' operation and its action
		if (nodeType === 'n8n-nodes-base.mongoDb' && option.value === 'delete') {
			return false;
		}
		// For PostgreSQL: hide 'deleteTable' operation and its action
		if (nodeType === 'n8n-nodes-base.postgres' && option.value === 'deleteTable') {
			return false;
		}
		return true;
	});

	// Return a modified parameter with filtered options
	return {
		...parameter,
		options: filteredOptions,
	};
}

/**
 * Check if current user can perform delete operations
 */
export function canPerformDeleteOperations(): boolean {
	const usersStore = useUsersStore();
	const currentUser = usersStore.currentUser;

	// Owners and admins can perform delete operations, members cannot
	return currentUser?.role === 'global:owner' || currentUser?.role === 'global:admin';
}
