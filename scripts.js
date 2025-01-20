const API_KEY = 'b5b9865c-aa2c-4be8-8503-baf69be1dc91';
const BASE_URL = 'http://cat-facts-api.std-900.ist.mospolytech.ru/api';

// Функция отображения уведомлений
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

// Загрузка курсов
async function loadCourses(page = 1, searchQuery = '', level = '') {
    try {
        const response = await fetch(`${BASE_URL}/courses?api_key=${API_KEY}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error('Error loading data');
        }

        let courses = await response.json();
        
        if (!Array.isArray(courses)) {
            throw new Error('Invalid data format');
        }

        // Apply filters
        if (searchQuery || level) {
            courses = courses.filter(course => {
                const matchesSearch = searchQuery ? 
                    (course.name.toLowerCase().includes(searchQuery) || 
                     course.description.toLowerCase().includes(searchQuery)) : 
                    true;
                
                const matchesLevel = level ? 
                    course.level.toLowerCase() === level.toLowerCase() : 
                    true;

                return matchesSearch && matchesLevel;
            });
        }

        const coursesList = document.getElementById('coursesList');
        coursesList.innerHTML = '';

        if (courses.length === 0) {
            coursesList.innerHTML = '<div class="col-12 text-center">Courses not found</div>';
        } else {
            courses.forEach(course => {
                const courseElement = createCourseElement(course);
                coursesList.appendChild(courseElement);
            });
        }
    } catch (error) {
        showNotification('Error loading courses', 'danger');
        console.error('Error:', error);
    }
}

// Создание элемента курса
function createCourseElement(course) {
    const col = document.createElement('div');
    col.className = 'col-md-4 mb-4';
    col.innerHTML = `
        <div class="course-card">
            <div class="card-header">
                <h5 class="card-title">${course.name}</h5>
            </div>
            <div class="card-body">
                <div class="course-info">
                    <div class="info-item">
                        <i class="bi bi-person-fill"></i>
                        <span>Teacher: ${course.teacher}</span>
                    </div>
                    <div class="info-item">
                        <i class="bi bi-bar-chart-fill"></i>
                        <span>Level: ${course.level}</span>
                    </div>
                    <div class="info-item">
                        <i class="bi bi-clock-fill"></i>
                        <span>Duration: ${course.total_length * course.week_length} h.</span>
                    </div>
                    <div class="info-item">
                        <i class="bi bi-cash"></i>
                        <span>${course.course_fee_per_hour}₽/hour</span>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="openOrderModal(${course.id})">
                    <i class="bi bi-check-circle"></i>
                    Enroll Now
                </button>
            </div>
        </div>
    `;
    return col;
}

// Поиск курсов
function searchCourses() {
    const searchQuery = document.getElementById('courseSearch').value.toLowerCase();
    const levelFilter = document.getElementById('levelFilter').value;
    loadCourses(1, searchQuery, levelFilter);
}

// Загрузка репетиторов
async function loadTutors(level = '') {
    try {
        const response = await fetch(`${BASE_URL}/tutors?api_key=${API_KEY}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load tutors');
        }

        const tutors = await response.json();
        const tutorsContainer = document.getElementById('tutorsList');
        tutorsContainer.innerHTML = '';

        const filteredTutors = level ? 
            tutors.filter(tutor => tutor.language_level.toLowerCase() === level.toLowerCase()) : 
            tutors;

        filteredTutors.forEach(tutor => {
            const tutorElement = createTutorElement(tutor);
            tutorsContainer.appendChild(tutorElement);
        });

    } catch (error) {
        showNotification(error.message, 'danger');
        console.error('Error:', error);
    }
}

// Создание элемента наставника
function createTutorElement(tutor) {
    const col = document.createElement('div');
    col.className = 'col-md-4 mb-4';
    col.innerHTML = `
        <div class="tutor-card">
            <div class="card-header">
                <h5 class="card-title">${tutor.name}</h5>
            </div>
            <div class="card-body">
                <div class="tutor-details">
                    <div class="tutor-detail-item">
                        <i class="bi bi-mortarboard-fill"></i>
                        <span>${tutor.language_level}</span>
                    </div>
                    <div class="tutor-detail-item">
                        <i class="bi bi-translate"></i>
                        <span>${tutor.languages_spoken.join(', ')}</span>
                    </div>
                    <div class="tutor-detail-item">
                        <i class="bi bi-star-fill"></i>
                        <span>Experience: ${tutor.work_experience} years</span>
                    </div>
                    <div class="tutor-detail-item">
                        <i class="bi bi-cash"></i>
                        <span>${tutor.price_per_hour}₽/hour</span>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="openOrderModal(${tutor.id}, true)">
                    <i class="bi bi-calendar-check"></i>
                    Book Lesson
                </button>
            </div>
        </div>
    `;
    return col;
}

// Открытие модального окна заказа
async function openOrderModal(id, isTutor = false) {
    try {
        const response = await fetch(`${BASE_URL}/${isTutor ? 'tutors' : 'courses'}/${id}?api_key=${API_KEY}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Error loading data');
        }

        const data = await response.json();
        const form = document.getElementById('orderForm');
        
        // Сохраните данные в форме
        form.dataset.id = id;
        form.dataset.type = isTutor ? 'tutor' : 'course';
        form.dataset.basePrice = isTutor ? data.price_per_hour : data.course_fee_per_hour;
        form.dataset.duration = isTutor ? 1 : (data.total_length * data.week_length);
        
        // Заполните форму данными
        document.getElementById('courseName').value = data.name;
        
        // Освободите и заполните временные интервалы
        const startTimeSelect = document.getElementById('startTime');
        startTimeSelect.innerHTML = '';
        
        // Стандартные временные интервалы для всех типов регистрации
        const timeSlots = [
            '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
            '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
        ];
        
        timeSlots.forEach(time => {
            const timeOption = document.createElement('option');
            timeOption.value = time;
            timeOption.textContent = time;
            startTimeSelect.appendChild(timeOption);
        });

        // Установите минимальную дату
        const dateInput = document.getElementById('startDate');
        const today = new Date();
        today.setDate(today.getDate() + 1); // Minimum the next day
        dateInput.min = today.toISOString().split('T')[0];
        dateInput.value = today.toISOString().split('T')[0];

        // Сброс других полей формы
        document.getElementById('studentsCount').value = 1;
        document.getElementById('supplementary').checked = false;
        calculateTotalPrice(); // Recalculate the cost

        const modal = new bootstrap.Modal(document.getElementById('orderModal'));
        modal.show();
    } catch (error) {
        showNotification(error.message, 'danger');
        console.error('Error:', error);
    }
}

// Обновление функции расчета цены
function calculateTotalPrice() {
    const form = document.getElementById('orderForm');
    const basePrice = parseFloat(form.dataset.basePrice);
    const studentsCount = parseInt(document.getElementById('studentsCount').value) || 0;
    const duration = parseInt(form.dataset.duration) || 1;
    let totalPrice = basePrice * studentsCount * duration;

    // Автоматические скидки
    const startDate = new Date(document.getElementById('startDate').value);
    const currentDate = new Date();
    const monthDiff = startDate.getMonth() - currentDate.getMonth() + 
        (12 * (startDate.getFullYear() - currentDate.getFullYear()));
    
    let discountText = [];
    let extraChargesText = [];

    // Ранняя регистрация (за месяц до начала)
    if (monthDiff >= 1) {
        totalPrice *= 0.9; // 10% 
        discountText.push('Early registration discount: -10%');
    }

    // Групповая регистрация (5 и более человек)
    if (studentsCount >= 5) {
        totalPrice *= 0.85; // 15% 
        discountText.push('Group discount: -15%');
        document.getElementById('groupDiscount').style.display = 'block';
    } else {
        document.getElementById('groupDiscount').style.display = 'none';
    }

    // Дополнительные опции
    // Интенсивный курс
    if (document.getElementById('intensiveCourse').checked) {
        totalPrice *= 1.2;
        extraChargesText.push('Intensive course: +20%');
    }

    // Дополнительные материалы
    if (document.getElementById('supplementary').checked) {
        totalPrice += 2000 * studentsCount;
        extraChargesText.push(`Supplementary materials: +${2000 * studentsCount}₽`);
    }

    // Индивидуальные уроки
    if (document.getElementById('personalized').checked) {
        const weeksCount = Math.ceil(duration / 7);
        totalPrice += 1500 * weeksCount;
        extraChargesText.push(`Personalized lessons: +${1500 * weeksCount}₽`);
    }

    // Культурные экскурсии
    if (document.getElementById('excursions').checked) {
        totalPrice *= 1.25;
        extraChargesText.push('Cultural excursions: +25%');
    }

    // Оценка уровня
    if (document.getElementById('assessment').checked) {
        totalPrice += 300;
        extraChargesText.push('Level assessment: +300₽');
    }

    // Интерактивная платформа
    if (document.getElementById('interactive').checked) {
        totalPrice *= 1.5;
        extraChargesText.push('Interactive platform: +50%');
    }

    // Обновление информации о скидках
    const discountsBlock = document.getElementById('autoDiscounts');
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

    // Обновление отображения цен
    document.getElementById('totalPrice').value = `${Math.round(totalPrice)}₽`;
    return Math.round(totalPrice);
}

// Отправка заказа
async function submitOrder() {
    try {
        const form = document.getElementById('orderForm');
        const studentsCount = parseInt(document.getElementById('studentsCount').value);
        const startDate = document.getElementById('startDate').value;
        const startTime = document.getElementById('startTime').value;

        if (!startDate || !startTime || !studentsCount) {
            throw new Error('Please fill in all required fields');
        }
        
        // Основные данные заказа
        const formData = {
            [form.dataset.type === 'tutor' ? 'tutor_id' : 'course_id']: parseInt(form.dataset.id),
            date_start: startDate,
            time_start: startTime,
            persons: studentsCount,
            duration: form.dataset.type === 'tutor' ? 1 : parseInt(form.dataset.duration),
            
            // Дополнительные опции
            supplementary: document.getElementById('supplementary').checked,
            early_registration: false,
            group_enrollment: studentsCount >= 5,
            intensive_course: false,
            personalized: false,
            excursions: false,
            assessment: false,
            interactive: false,
            
            // Расчет цены
            price: calculateTotalPrice()
        };

        // Проверьте раннюю регистрацию (за месяц до начала)
        const orderDate = new Date(startDate);
        const currentDate = new Date();
        const monthDiff = orderDate.getMonth() - currentDate.getMonth() + 
            (12 * (orderDate.getFullYear() - currentDate.getFullYear()));
        formData.early_registration = monthDiff >= 1;

        const response = await fetch(`${BASE_URL}/orders?api_key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Error sending order');
        }

        showNotification('Order successfully sent');
        bootstrap.Modal.getInstance(document.getElementById('orderModal')).hide();
    } catch (error) {
        showNotification(error.message, 'danger');
        console.error('Error:', error);
    }
}

// Обновление инициализации при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadCourses();
    loadTutors();
    
    // Обработчики событий для расчета цены
    document.getElementById('studentsCount').addEventListener('input', calculateTotalPrice);
    document.getElementById('supplementary').addEventListener('change', calculateTotalPrice);
    
    // Обработчики событий для поиска курса (мгновенный поиск по введенным данным)
    document.getElementById('courseSearch').addEventListener('input', () => searchCourses());
    document.getElementById('levelFilter').addEventListener('change', () => searchCourses());
    
    //Обработчик события для поиска репетитора
    document.getElementById('tutorLevel').addEventListener('change', () => {
        const level = document.getElementById('tutorLevel').value;
        loadTutors(level);
    });
    
    // Предотвращение отправки формы
    document.getElementById('courseSearchForm').addEventListener('submit', (e) => e.preventDefault());
    document.getElementById('tutorSearchForm').addEventListener('submit', (e) => e.preventDefault());

    // Добавьте слушателей событий для всех опций
    const options = [
        'intensiveCourse', 'supplementary', 'personalized',
        'excursions', 'assessment', 'interactive'
    ];
    
    options.forEach(option => {
        document.getElementById(option)?.addEventListener('change', calculateTotalPrice);
    });
}); 