const MyForm = {
    validate: () => {
        const validateByFieldName = (fieldName, fieldData) => {
            const validateFIO = (FIOData) => {
                const threeWordRegex = /\S+\s+\S+\s+\S+/i;
                return threeWordRegex.test(FIOData);
            };

            const validateEmail = (emailData) => {
                const emailRegex = /^([A-Za-z0-9_\-\.])+\@(ya\.ru|(yandex\.(ru|ua|by|kz|com)))$/i;
                return emailRegex.test(emailData);
            };

            const validatePhone = (phoneData) => {
                const phoneRegex = /^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/i;
                const phoneNumbersSum = phoneData
                    .split('')
                    .filter(char => !isNaN(char))
                    .reduce((total, number) => total + parseInt(number), 0);

                return phoneRegex.test(phoneData) && phoneNumbersSum <= 30;
            };

            const validators = {
                fio: validateFIO,
                email: validateEmail,
                phone: validatePhone
            };

            return validators[fieldName]
                ? validators[fieldName](fieldData)
                : true;
        };

        const errorFieldsNames = formInputFields.reduce((errorObj, field) => {
            if (!validateByFieldName(field.name, field.value)) {
                errorObj.push(field.name);
            }
            return errorObj;
        }, []);

        return {
            isValid: errorFieldsNames.length === 0 ? true : false,
            errorFields: errorFieldsNames
        };
    },
    getData: () => {
        return formInputFields.reduce((result, field) => {
            result[field.name] = field.value;
            return result;
        }, {});
    },
    setData: (formData) => {
        if (typeof formData !== 'object') {
            return new Error('Method accepts object as argument');
        }
        for (const fieldName in formData) {
            const foundField = formInputFields.find(field => field.name === fieldName);
            if (formData.hasOwnProperty(fieldName) && foundField) {
                foundField.value = formData[fieldName];
            }
        }
    },
    submit: (e) => {
        e.preventDefault();

        const handleFieldValidationClasses = (errorFields) => {
            formInputFields.forEach((field) => {
                errorFields.includes(field.name)
                    ? field.classList.add('error')
                    : field.classList.remove('error');
            });
        };

        async function sendRequest() {
            const resultContainer = document.getElementById('resultContainer');
            resultContainer.classList = [];
            resultContainer.innerHTML = '';

            const result = JSON.parse(await httpGet(form.action));

            switch (result.status) {
                case 'success':
                    resultContainer.classList.add('success');
                    resultContainer.innerHTML = 'Success';
                break;
                case 'error':
                    resultContainer.classList.add('error');
                    resultContainer.innerHTML = result.reason;
                break;
                case 'progress':
                    resultContainer.classList.add('progress');
                    setTimeout(() => sendRequest(), result.timeout);
                break;
                default:
                    throw new Error('unknown status');
            }
        }
        const { isValid, errorFields } = MyForm.validate();
        handleFieldValidationClasses(errorFields);

        if (isValid) {
            submitBtn.disabled = true;
            try {
                sendRequest();
            } catch (error) {
                throw new Error(error);
            }
        }
    }
};

const form = document.getElementById('myForm');
const formInputFields = [...form.elements].filter(el => el.tagName === 'INPUT');
const submitBtn = document.getElementById('submitButton');

form.addEventListener('submit', MyForm.submit);

function httpGet(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = function () {
            if (this.status == 200) {
                resolve(this.response);
            } else {
                const error = new Error(this.statusText);
                error.code = this.status;
                reject(error);
            }
        };

        xhr.onerror = function () {
            reject(new Error('Network Error'));
        };

        xhr.send();
    });
}

// Settings to change server response
const selectResponseCase = (caseName) => {
    // Rly hope that this api would still be working 🙏

    switch (caseName) {
        case 'success':
            form.action = 'https://api.myjson.com/bins/tbnfx';
        break;
        case 'error':
            form.action = 'https://api.myjson.com/bins/dwivh';
        break;
        case 'progress':
            form.action = 'https://api.myjson.com/bins/1fetzh';
        break;
        default:
            form.action = 'https://api.myjson.com/bins/tbnfx';
    }

    document.getElementById('settings-value').innerHTML = caseName;
};

const settingsButtons = [...document.getElementById('settings').elements];
settingsButtons.forEach((radio) => {
    radio.addEventListener('click', (e) => {
        selectResponseCase(e.target.value);
    });
});
