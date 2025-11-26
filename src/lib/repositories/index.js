import MenuRepository from './MenuRepository.js';

let menuRepoInstance = null;

export async function getMenuRepository() {
    if (!menuRepoInstance) {
        menuRepoInstance = new MenuRepository();
    }
    return menuRepoInstance;
}

export { MenuRepository };
