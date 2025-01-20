const API_KEY = 'b5b9865c-aa2c-4be8-8503-baf69be1dc91';
const BASE_URL = 'http://cat-facts-api.std-900.ist.mospolytech.ru/api';

// Функция для отображения уведомлений
function showNotification(message, type = 'success') {
    const notifications = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification alert alert-${type}`;
    notification.textContent = message;
    notifications.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Обновляем функцию загрузки заявок
async function loadOrders() {
    try {
        const response = await fetch(`${BASE_URL}/orders?api_key=${API_KEY}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Error loading data');
        }

        const orders = await response.json();
        
        if (!Array.isArray(orders)) {
            throw new Error('Invalid data format');
        }

        const ordersList = document.getElementById('ordersList');
        ordersList.innerHTML = '';

        if (orders.length === 0) {
            ordersList.innerHTML = '<tr><td colspan="5" class="text-center">You have no orders yet</td></tr>';
        } else {
            // Загружаем все курсы и репетиторов для получения их названий/имен
            const [coursesResponse, tutorsResponse] = await Promise.all([
                fetch(`${BASE_URL}/courses?api_key=${API_KEY}`),
                fetch(`${BASE_URL}/tutors?api_key=${API_KEY}`)
            ]);

            const courses = await coursesResponse.json();
            const tutors = await tutorsResponse.json();

            // Создаем мапы для быстрого поиска
            const coursesMap = new Map(courses.map(course => [course.id, course]));
            const tutorsMap = new Map(tutors.map(tutor => [tutor.id, tutor]));

            orders.forEach((order, index) => {
                // Получаем название курса или имя репетитора
                let entityName = '';
                if (order.course_id) {
                    const course = coursesMap.get(order.course_id);
                    entityName = `Course: ${course ? course.name : 'Unknown course'}`;
                } else {
                    const tutor = tutorsMap.get(order.tutor_id);
                    entityName = `Tutor: ${tutor ? tutor.name : 'Unknown tutor'}`;
                }

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${entityName}</td>
                    <td>${order.date_start} ${order.time_start}</td>
                    <td>${order.price}₽</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="showDetails(${order.id})">
                            Details
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="openEditModal(${order.id})">
                            Edit
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="showDeleteConfirm(${order.id})">
                            Delete
                        </button>
                    </td>
                `;
                ordersList.appendChild(row);
            });
        }
    } catch (error) {
        showNotification('Error loading data', 'danger');
        console.error('Error:', error);
    }
}

// Обновляем функцию показа деталей заявки
async function showDetails(orderId) {
    try {
        const [orderResponse, coursesResponse, tutorsResponse] = await Promise.all([
            fetch(`${BASE_URL}/orders/${orderId}?api_key=${API_KEY}`),
            fetch(`${BASE_URL}/courses?api_key=${API_KEY}`),
            fetch(`${BASE_URL}/tutors?api_key=${API_KEY}`)
        ]);

        const order = await orderResponse.json();
        const courses = await coursesResponse.json();
        const tutors = await tutorsResponse.json();

        let entityName = '';
        if (order.course_id) {
            const course = courses.find(c => c.id === order.course_id);
            entityName = course ? course.name : 'Unknown course';
        } else {
            const tutor = tutors.find(t => t.id === order.tutor_id);
            entityName = tutor ? tutor.name : 'Unknown tutor';
        }
        
        const detailsContent = document.getElementById('orderDetails');
        detailsContent.innerHTML = `
            <dl class="row">
                <dt class="col-sm-4">Type:</dt>
                <dd class="col-sm-8">${order.course_id ? 'Course' : 'Tutor'}</dd>
                
                <dt class="col-sm-4">Name:</dt>
                <dd class="col-sm-8">${entityName}</dd>
                
                <dt class="col-sm-4">Start date:</dt>
                <dd class="col-sm-8">${order.date_start}</dd>
                
                <dt class="col-sm-4">Start time:</dt>
                <dd class="col-sm-8">${order.time_start}</dd>
                
                <dt class="col-sm-4">Number of students:</dt>
                <dd class="col-sm-8">${order.persons}</dd>
                
                <dt class="col-sm-4">Cost:</dt>
                <dd class="col-sm-8">${order.price}₽</dd>
                
                <dt class="col-sm-4">Additional options:</dt>
                <dd class="col-sm-8">
                    <ul class="list-unstyled">
                        ${order.supplementary ? '<li>Additional materials</li>' : ''}
                        ${order.early_registration ? '<li>Early registration</li>' : ''}
                        ${order.group_enrollment ? '<li>Group enrollment</li>' : ''}
                        ${order.intensive_course ? '<li>Intensive course</li>' : ''}
                    </ul>
                </dd>
            </dl>
        `;
        
        const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
        modal.show();
    } catch (error) {
        showNotification(error.message, 'danger');
        console.error('Error:', error);
    }
}

// Добавляем функцию заполнения времен
function fillTimeSlots(selectElement) {
    selectElement.innerHTML = '';
    const timeSlots = [
        '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
        '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
    ];
    
    timeSlots.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = time;
        selectElement.appendChild(option);
    });
}

// Обновляем функцию открытия модального окна редактирования
async function openEditModal(orderId) {
    try {
        const [orderResponse, coursesResponse, tutorsResponse] = await Promise.all([
            fetch(`${BASE_URL}/orders/${orderId}?api_key=${API_KEY}`),
            fetch(`${BASE_URL}/courses?api_key=${API_KEY}`),
            fetch(`${BASE_URL}/tutors?api_key=${API_KEY}`)
        ]);

        if (!orderResponse.ok) throw new Error('Error loading data');
        
        const order = await orderResponse.json();
        const courses = await coursesResponse.json();
        const tutors = await tutorsResponse.json();
        
        // Получаем базовую цену из курса/репетитора
        let basePrice;
        if (order.course_id) {
            const course = courses.find(c => c.id === order.course_id);
            basePrice = course ? course.course_fee_per_hour : 0;
        } else {
            const tutor = tutors.find(t => t.id === order.tutor_id);
            basePrice = tutor ? tutor.price_per_hour : 0;
        }
        
        // Заполняем поля формы
        document.getElementById('editOrderId').value = orderId;
        document.getElementById('editStartDate').value = order.date_start;
        document.getElementById('editStudentsCount').value = order.persons;
        
        // Заполняем временные слоты
        const timeSelect = document.getElementById('editStartTime');
        fillTimeSlots(timeSelect);
        timeSelect.value = order.time_start;
        
        // Устанавливаем дополнительные опции
        document.getElementById('editSupplementary').checked = order.supplementary;
        document.getElementById('editIntensiveCourse').checked = order.intensive_course;
        document.getElementById('editPersonalized').checked = order.personalized;
        document.getElementById('editExcursions').checked = order.excursions;
        document.getElementById('editAssessment').checked = order.assessment;
        document.getElementById('editInteractive').checked = order.interactive;
        
        // Сохраняем базовую цену и длительность
        const form = document.getElementById('editForm');
        form.dataset.basePrice = basePrice;
        form.dataset.duration = order.duration;
        
        // Рассчитываем стоимость
        calculateEditPrice();
        
        const modal = new bootstrap.Modal(document.getElementById('editModal'));
        modal.show();
    } catch (error) {
        showNotification(error.message, 'danger');
    }
}

// Обновляем функцию расчета стоимости при редактировании
function calculateEditPrice() {
    const form = document.getElementById('editForm');
    const basePrice = parseFloat(form.dataset.basePrice);
    const studentsCount = parseInt(document.getElementById('editStudentsCount').value) || 0;
    const duration = parseInt(form.dataset.duration) || 1;
    let totalPrice = basePrice * studentsCount * duration;

    // Автоматические скидки
    const startDate = new Date(document.getElementById('editStartDate').value);
    const currentDate = new Date();
    const monthDiff = startDate.getMonth() - currentDate.getMonth() + 
        (12 * (startDate.getFullYear() - currentDate.getFullYear()));
    
    let discountText = [];
    let extraChargesText = [];

    // Ранняя регистрация
    if (monthDiff >= 1) {
        totalPrice *= 0.9;
        discountText.push('Early registration discount: -10%');
    }

    // Групповая скидка
    if (studentsCount >= 5) {
        totalPrice *= 0.85;
        discountText.push('Group discount: -15%');
        document.getElementById('editGroupDiscount').style.display = 'block';
    } else {
        document.getElementById('editGroupDiscount').style.display = 'none';
    }

    // Дополнительные опции
    if (document.getElementById('editIntensiveCourse').checked) {
        totalPrice *= 1.2;
        extraChargesText.push('Intensive course: +20%');
    }

    if (document.getElementById('editSupplementary').checked) {
        totalPrice += 2000 * studentsCount;
        extraChargesText.push(`Additional materials: +${2000 * studentsCount}₽`);
    }

    if (document.getElementById('editPersonalized').checked) {
        const weeksCount = Math.ceil(duration / 7);
        totalPrice += 1500 * weeksCount;
        extraChargesText.push(`Individual lessons: +${1500 * weeksCount}₽`);
    }

    if (document.getElementById('editExcursions').checked) {
        totalPrice *= 1.25;
        extraChargesText.push('Cultural excursions: +25%');
    }

    if (document.getElementById('editAssessment').checked) {
        totalPrice += 300;
        extraChargesText.push('Level assessment: +300₽');
    }

    if (document.getElementById('editInteractive').checked) {
        totalPrice *= 1.5;
        extraChargesText.push('Interactive platform: +50%');
    }

    // Обновляем информацию о скидках
    const discountsBlock = document.getElementById('editAutoDiscounts');
    let discountsHtml = '';
    
    if (discountText.length > 0) {
        discountsHtml += '<h6>Applied discounts:</h6><ul class="mb-0">';
        discountText.forEach(text => {
            discountsHtml += `<li>${text}</li>`;
        });
        discountsHtml += '</ul>';
    }
    
    if (extraChargesText.length > 0) {
        if (discountsHtml) discountsHtml += '<hr>';
        discountsHtml += '<h6>Additional services:</h6><ul class="mb-0">';
        extraChargesText.forEach(text => {
            discountsHtml += `<li>${text}</li>`;
        });
        discountsHtml += '</ul>';
    }
    
    discountsBlock.innerHTML = discountsHtml;
    discountsBlock.style.display = discountsHtml ? 'block' : 'none';

    document.getElementById('editTotalPrice').value = `${Math.round(totalPrice)}₽`;
    return Math.round(totalPrice);
}

// Обновляем функцию сохранения изменений
async function updateOrder() {
    try {
        const orderId = document.getElementById('editOrderId').value;
        const studentsCount = parseInt(document.getElementById('editStudentsCount').value);
        const startDate = document.getElementById('editStartDate').value;
        const startTime = document.getElementById('editStartTime').value;

        if (!startDate || !startTime || !studentsCount) {
            throw new Error('Please fill in all required fields');
        }

        const formData = {
            date_start: startDate,
            time_start: startTime,
            persons: studentsCount,
            supplementary: document.getElementById('editSupplementary').checked,
            intensive_course: document.getElementById('editIntensiveCourse').checked,
            personalized: document.getElementById('editPersonalized').checked,
            excursions: document.getElementById('editExcursions').checked,
            assessment: document.getElementById('editAssessment').checked,
            interactive: document.getElementById('editInteractive').checked,
            price: calculateEditPrice()
        };

        const response = await fetch(`${BASE_URL}/orders/${orderId}?api_key=${API_KEY}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Error updating order');

        showNotification('Order successfully updated');
        bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
        loadOrders(); // Перезагружаем список заявок
    } catch (error) {
        showNotification(error.message, 'danger');
    }
}

// Показ подтверждения удаления
function showDeleteConfirm(orderId) {
    document.querySelector('#deleteModal .btn-danger').dataset.orderId = orderId;
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
}

// Подтверждение удаления
async function confirmDelete() {
    try {
        const orderId = document.querySelector('#deleteModal .btn-danger').dataset.orderId;
        
        const response = await fetch(`${BASE_URL}/orders/${orderId}?api_key=${API_KEY}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Error deleting');
        }

        showNotification('Order successfully deleted');
        bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
        loadOrders();
    } catch (error) {
        showNotification(error.message, 'danger');
        console.error('Error:', error);
    }
}

// Добавляем обработчики событий
document.addEventListener('DOMContentLoaded', () => {
    loadOrders();

    // Добавляем обработчики для всех опций редактирования
    const editOptions = [
        'editIntensiveCourse', 'editSupplementary', 'editPersonalized',
        'editExcursions', 'editAssessment', 'editInteractive'
    ];
    
    editOptions.forEach(option => {
        document.getElementById(option)?.addEventListener('change', calculateEditPrice);
    });
}); 