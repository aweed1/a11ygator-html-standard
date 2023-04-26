import { render } from 'mustache';

const view = {
    title: "Joe",
    calc: function () {
        return 2 + 4;
    }
}

const output = render("{{title}} spends {{calc}}", view)

function renderTemplate(templatePath, data) {
    fetch(templatePath)
    .then(response => response.text())
    .then(template => {
        const rendered = render(template, data)
        document.getElementById('target').innerHTML = rendered;
    })
}

export default renderTemplate