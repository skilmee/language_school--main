let map;
let currentMarkers = [];

// Обновление данных о ресурсах
const resources = [
    // Образовательные центры
    {
        type: 'education',
        name: 'Языковая школа',
        coordinates: [55.751244, 37.618423],
        address: 'ул. Тверская, 15, Москва',
        hours: 'Пн-Пт: 9:00 - 21:00',
        phone: '+7 (495) 123-45-67',
        description: 'Основной образовательный центр с современными классами',
        keywords: ['основной', 'центр', 'классы']
    },
    {
        type: 'education',
        name: 'Центр для детей',
        coordinates: [55.744244, 37.608423],
        address: 'ул. Арбат, 10, Москва',
        hours: 'Пн-Вс: 10:00 - 20:00',
        phone: '+7 (495) 345-67-89',
        description: 'Специализированный центр для детей',
        keywords: ['дети', 'детский']
    },
    // Курсы
    {
        type: 'courses',
        name: 'Бизнес-центр',
        coordinates: [55.757244, 37.631423],
        address: 'ул. Мясницкая, 24, Москва',
        hours: 'Пн-Пт: 8:00 - 22:00',
        phone: '+7 (495) 234-56-78',
        description: 'Центр обучения деловому языку',
        keywords: ['бизнес', 'корпоративный']
    },
    {
        type: 'courses',
        name: 'Профессиональный центр GlobalSpeak',
        coordinates: [55.758463, 37.643016],
        address: 'ул. Покровка, 47, Москва',
        hours: 'Пн-Пт: 9:00 - 21:00',
        phone: '+7 (495) 876-54-32',
        description: 'Центр профессионального развития',
        keywords: ['профессиональный', 'развитие']
    },
    // Библиотеки
    {
        type: 'library',
        name: 'Ресурсный центр GlobalSpeak',
        coordinates: [55.764244, 37.621423],
        address: 'ул. Петровка, 30, Москва',
        hours: 'Пн-Сб: 10:00 - 21:00',
        phone: '+7 (495) 456-78-90',
        description: 'Современная библиотека и центр самообучения',
        keywords: ['библиотека', 'самообучение']
    },
    {
        type: 'library',
        name: 'Медиатека GlobalSpeak',
        coordinates: [55.769452, 37.595384],
        address: 'ул. Тверская, 8, Москва',
        hours: 'Пн-Вс: 10:00 - 20:00',
        phone: '+7 (495) 987-65-43',
        description: 'Мультимедийные ресурсы и материалы',
        keywords: ['медиа', 'мультимедиа']
    },
    // Общественные центры
    {
        type: 'community',
        name: 'Культурный центр',
        coordinates: [55.741469, 37.626211],
        address: 'ул. Пятницкая, 42, Москва',
        hours: 'Ежедневно: 11:00 - 23:00',
        phone: '+7 (495) 345-67-89',
        description: 'Центр культурного обмена и мероприятий',
        keywords: ['культура', 'мероприятия']
    },
    {
        type: 'community',
        name: 'Общественные встречи',
        coordinates: [55.745068, 37.566374],
        address: 'Кутузовский проспект, 45, Москва',
        hours: 'Ежедневно: 10:00 - 22:00',
        phone: '+7 (495) 234-56-78',
        description: 'Общественные встречи и языковая практика',
        keywords:['сообщество', 'практика']
    }
];


// Инициализация карты
ymaps.ready(init);

function init() {
    map = new ymaps.Map('map', {
        center: [55.751244, 37.618423],
        zoom: 13,
        controls: ['zoomControl', 'searchControl']
    });

    showResources();
    updateResourcesList(resources);
}

// Отображение ресурсов на карте
function showResources(filter = 'all') {
    currentMarkers.forEach(marker => map.geoObjects.remove(marker));
    currentMarkers = [];

    resources.forEach(resource => {
        if (filter === 'all' || resource.type === filter) {
            const marker = new ymaps.Placemark(resource.coordinates, {
                balloonContent: `
                    <h5>${resource.name}</h5>
                    <p>${resource.address}</p>
                `
            }, {
                preset: getPresetForType(resource.type)
            });

            marker.events.add('click', () => showResourceInfo(resource));
            map.geoObjects.add(marker);
            currentMarkers.push(marker);
        }
    });
}

// Получение стиля маркера на основе типа ресурса
function getPresetForType(type) {
    const presets = {
        education: 'islands#blueEducationIcon',
        library: 'islands#brownBookIcon',
        cafe: 'islands#greenCafeIcon',
        community: 'islands#orangeHomeIcon',
        courses: 'islands#violetCircleDotIcon'
    };
    return presets[type] || 'islands#blueCircleDotIcon';
}

// Отображение информации о ресурсах
function showResourceInfo(resource) {
    const infoBlock = document.getElementById('resourceInfo');
    infoBlock.innerHTML = `
        <h5>${resource.name}</h5>
        <p><i class="bi bi-geo-alt"></i> ${resource.address}</p>
        <p><i class="bi bi-clock"></i> ${resource.hours}</p>
        <p><i class="bi bi-telephone"></i> ${resource.phone}</p>
        <p><i class="bi bi-info-circle"></i> ${resource.description}</p>
    `;
}

// Обновите HTML для отображения списка мест
function updateResourcesList(resources) {
    const listContainer = document.getElementById('resourcesList');
    listContainer.innerHTML = '';

    resources.forEach(resource => {
        const card = document.createElement('div');
        card.className = 'resource-card';
        card.innerHTML = `
            <div class="card-header">
                <h6 class="card-title">${resource.name}</h6>
            </div>
            <div class="card-body">
                <div class="card-text">
                    <p class="location-info">
                        <i class="bi bi-geo-alt-fill"></i>
                        <span>${resource.address}</span>
                    </p>
                    <p class="time-info">
                        <i class="bi bi-clock-fill"></i>
                        <span>${resource.hours}</span>
                    </p>
                    <p class="phone-info">
                        <i class="bi bi-telephone-fill"></i>
                        <span>${resource.phone}</span>
                    </p>
                </div>
                <button class="btn btn-primary" onclick="showResourceOnMap('${resource.name}')">
                    <i class="bi bi-map"></i> Show on map
                </button>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

// Функция отображения ресурса на карте
function showResourceOnMap(resourceName) {
    const resource = resources.find(r => r.name === resourceName);
    if (resource) {
        map.setCenter(resource.coordinates, 15);
        showResourceInfo(resource);
        
       
        currentMarkers.forEach(marker => {
            if (marker.properties.get('resourceName') === resourceName) {
                marker.balloon.open();
            }
        });
    }
}

// Обновление функции поиска
function searchResources() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const filteredResources = resources.filter(resource => 
        resource.name.toLowerCase().includes(searchQuery) ||
        resource.description.toLowerCase().includes(searchQuery) ||
        resource.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery))
    );

    // Обновление маркеров на карте
    currentMarkers.forEach(marker => map.geoObjects.remove(marker));
    currentMarkers = [];

    // Показать найденные ресурсы
    filteredResources.forEach(resource => {
        const marker = new ymaps.Placemark(resource.coordinates, {
            balloonContent: `
                <h5>${resource.name}</h5>
                <p>${resource.address}</p>
            `,
            resourceName: resource.name
        }, {
            preset: getPresetForType(resource.type)
        });

        marker.events.add('click', () => showResourceInfo(resource));
        map.geoObjects.add(marker);
        currentMarkers.push(marker);
    });

    // Обновление списка ресурсов
    updateResourcesList(filteredResources);
}

// Обновление функции фильтрации
function filterResources() {
    const filterValue = document.getElementById('resourceType').value;
    const filteredResources = filterValue === 'all' ? 
        resources : 
        resources.filter(resource => resource.type === filterValue);
    
    showResources(filterValue);
    updateResourcesList(filteredResources);
} 