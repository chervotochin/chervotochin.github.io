document.getElementById("lpForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const targetFunction = parseFloat(formData.get("targetFunction"));
    const numFlowerTypes = parseInt(formData.get("numFlowerTypes"));

    const model = {
        "optimize": "result",
        "opType": "min",
        "constraints": {},
        "variables": {},
        "ints": {}
    };

    for (let i = 1; i <= numFlowerTypes; i++) {
        const maxPricePercent = parseFloat(formData.get(`typePercentage${i}`));
        const maxPriceAbsolute = maxPricePercent / 100 * targetFunction;

        const flowerPrice = parseFloat(formData.get(`flowerPrice${i}`));

        model.constraints[`constraint${i}`] = { "equal": maxPriceAbsolute };
        model.variables[`x${i}`] = {};
        for (let j = 1; j <= numFlowerTypes; j++) {
            model.variables[`x${i}`][`constraint${j}`] = i === j ? parseInt(flowerPrice) : 0;
        }
    }

    const results = solver.Solve(model);

    const resultsDiv = document.getElementById("results");
    resultsDiv.classList.add("results-container");

    let table = "<h2>Результат:</h2><table><tr><th>Вид квіток</th><th>Кількість</th><th>Загальна ціна</th></tr>";
    let totalCost = 0;

    for (let key in results) {
        if (key.startsWith('x')) {
            const flowerType = key.substring(1);
            const roundedValue = Math.floor(results[key]);
            const flowerPrice = parseFloat(formData.get(`flowerPrice${flowerType}`));
            const totalFlowerPrice = (roundedValue * flowerPrice).toFixed(2);
            totalCost += parseFloat(totalFlowerPrice);
    
            table += `<tr><td>Вид ${flowerType}</td><td>${roundedValue}</td><td>${totalFlowerPrice}</td></tr>`;
        }
    }
    
    table += `<tr><td colspan="2"><b>Загальна ціна всіх квіток:</b></td><td><b>${totalCost}</b></td></tr>`;

    table += "</table>";
    resultsDiv.innerHTML = table;

    const hrElement = document.createElement("hr");
    hrElement.classList.add("hr-result");
    resultsDiv.insertBefore(hrElement, resultsDiv.firstChild);
});

document.getElementById("numFlowerTypes").addEventListener("change", function (event) {
    const numFlowerTypes = parseInt(event.target.value);
    const flowerPricesDiv = document.getElementById("flowerPrices");
    flowerPricesDiv.innerHTML = "";

    let totalPercentage = 0;

    for (let i = 1; i <= numFlowerTypes; i++) {
        const typePercenage = document.createElement("input");
        typePercenage.type = "number";
        typePercenage.id = `typePercentage${i}`;
        typePercenage.name = `typePercentage${i}`;
        typePercenage.placeholder = `Приблизний відсоток квіток виду ${i} у букеті`;
        typePercenage.required = true;

        const flowerPriceInput = document.createElement("input");
        flowerPriceInput.type = "text";
        flowerPriceInput.id = `flowerPrice${i}`;
        flowerPriceInput.name = `flowerPrice${i}`;
        flowerPriceInput.placeholder = `Ціна ${i} виду квіток`;
        flowerPriceInput.required = true;

        flowerPricesDiv.appendChild(typePercenage);
        flowerPricesDiv.appendChild(flowerPriceInput);
        flowerPricesDiv.appendChild(document.createElement("br"));
    }

    const totalPercentageDisplay = document.createElement("p");
    totalPercentageDisplay.textContent = "Загальний відсоток: 0%";
    flowerPricesDiv.appendChild(totalPercentageDisplay);

    function updateTotalPercentage() {
        totalPercentage = 0;
        let invalidInput = false;

        for (let i = 1; i <= numFlowerTypes; i++) {
            const typePercentageInput = document.getElementById(`typePercentage${i}`);
            const percentageValue = parseInt(typePercentageInput.value) || 0;

            if (percentageValue < 0) {
                invalidInput = true;
            }

            totalPercentage += percentageValue;
        }

        totalPercentageDisplay.textContent = `Загальний відсоток: ${totalPercentage}%`;

        if (totalPercentage > 100 || totalPercentage < 0) {
            totalPercentageDisplay.style.color = "red";
        } else if (totalPercentage < 100) {
            totalPercentageDisplay.style.color = "orange";
        } else {
            totalPercentageDisplay.style.color = "";
        }

    }

    updateTotalPercentage();

    const typePercentageInputs = document.querySelectorAll('[id^="typePercentage"]');
    typePercentageInputs.forEach(input => input.addEventListener("input", updateTotalPercentage));
});

document.getElementById("numFlowerTypes").dispatchEvent(new Event('change'));

document.getElementById("increaseFlowerTypes").addEventListener("click", function () {
    const numFlowerTypesInput = document.getElementById("numFlowerTypes");
    numFlowerTypesInput.stepUp();
    numFlowerTypesInput.dispatchEvent(new Event('change'));
});

document.getElementById("decreaseFlowerTypes").addEventListener("click", function () {
    const numFlowerTypesInput = document.getElementById("numFlowerTypes");
    numFlowerTypesInput.stepDown();
    numFlowerTypesInput.dispatchEvent(new Event('change'));
});

document.getElementById("invalidationFlowerTypes").addEventListener("click", function () {
    const numFlowerTypesInput = document.getElementById("numFlowerTypes");
    numFlowerTypesInput.value = "2";
    numFlowerTypesInput.dispatchEvent(new Event('change'));
});