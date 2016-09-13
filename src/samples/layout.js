


class App {
    constructor() {
        this.main = new XLayoutObject({
            parent: document.body,
            pattern: "3L",
            cells: [{
                id: "a",
                text: "Hierarchy",
                width: 250
            }, {
                id: "b",
                text: "Details"
            }]
        });
    }
}

var app = new App();