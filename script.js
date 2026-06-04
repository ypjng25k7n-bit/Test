const TAX_RATES = {
    GRUNDFREIBETRAG: 12348,
    SOLIDARITY_SURCHARGE: 0.055,
    SOLIDARITY_THRESHOLD: 972,
    KIRCHENSTEUER_RATE: 0.0,
};

const SOCIAL_INSURANCE = {
    KV_RATE: 0.073,
    KV_ZUSATZBEITRAG_AN: 0.0135,
    RV_RATE: 0.093,
    PV_RATE: 0.0305,
    ALV_RATE: 0.013,
};

function calculateIncomeTax(zvE) {
    if (zvE <= TAX_RATES.GRUNDFREIBETRAG) {
        return 0;
    } else if (zvE <= 17799) {
        const y = (zvE - TAX_RATES.GRUNDFREIBETRAG) / 10000;
        return (914.51 * y + 1400) * y;
    } else if (zvE <= 69878) {
        const z = (zvE - 17799) / 10000;
        return (173.1 * z + 2397) * z + 1034.87;
    } else if (zvE <= 277825) {
        return 0.42 * zvE - 11135.63;
    } else {
        return 0.45 * zvE - 19470.38;
    }
}

function calculateKirchensteuer(incomeTax) {
    return incomeTax * TAX_RATES.KIRCHENSTEUER_RATE;
}

function calculateSocialInsurance(brutto) {
    const kv = brutto * (SOCIAL_INSURANCE.KV_RATE + SOCIAL_INSURANCE.KV_ZUSATZBEITRAG_AN);
    const rv = brutto * SOCIAL_INSURANCE.RV_RATE;
    const pv = brutto * SOCIAL_INSURANCE.PV_RATE;
    const alv = brutto * SOCIAL_INSURANCE.ALV_RATE;

    return {
        krankenversicherung: kv,
        rentenversicherung: rv,
        pflegeversicherung: pv,
        arbeitslosenversicherung: alv,
        total: kv + rv + pv + alv,
    };
}

function calculateNetIncome(bruttoMonatlich) {
    const bruttoJaehrlich = bruttoMonatlich * 12;
    const socialInsurance = calculateSocialInsurance(bruttoMonatlich);
    const steuerlichesEinkommenJaehrlich = Math.max(0, bruttoJaehrlich - (socialInsurance.total * 12));
    const incomeTaxJaehrlich = calculateIncomeTax(steuerlichesEinkommenJaehrlich);

    let solidarityTax = 0;
    if (incomeTaxJaehrlich >= TAX_RATES.SOLIDARITY_THRESHOLD) {
        solidarityTax = incomeTaxJaehrlich * TAX_RATES.SOLIDARITY_SURCHARGE;
    }

    const totalIncomeTaxJaehrlich = incomeTaxJaehrlich + solidarityTax;
    const kirchensteuerJaehrlich = calculateKirchensteuer(totalIncomeTaxJaehrlich);
    const incomeTaxMonatlich = totalIncomeTaxJaehrlich / 12;
    const kirchensteuerMonatlich = kirchensteuerJaehrlich / 12;
    const nettoMonatlich = bruttoMonatlich - socialInsurance.total - incomeTaxMonatlich - kirchensteuerMonatlich;

    return {
        brutto: bruttoMonatlich,
        netto: nettoMonatlich,
    };
}

function formatEuro(value) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function displayResults(calculation) {
    const resultsDiv = document.getElementById('results');
    const emptyStateDiv = document.getElementById('emptyState');

    resultsDiv.style.display = 'flex';
    emptyStateDiv.style.display = 'none';

    document.getElementById('resultBrutto').textContent = formatEuro(calculation.brutto);
    document.getElementById('resultNetto').textContent = formatEuro(calculation.netto);

    setTimeout(() => {
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

document.getElementById('calculateBtn').addEventListener('click', function () {
    const bruttoInput = document.getElementById('bruttoInput').value;
    const brutto = parseFloat(bruttoInput) || 0;

    if (brutto <= 0) {
        alert('Bitte gib ein gültiges Bruttogehalt ein (größer als 0€)');
        return;
    }

    const calculation = calculateNetIncome(brutto);
    displayResults(calculation);
});

document.getElementById('bruttoInput').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        document.getElementById('calculateBtn').click();
    }
});

window.addEventListener('load', function () {
    document.getElementById('emptyState').style.display = 'block';
    document.getElementById('results').style.display = 'none';
});
