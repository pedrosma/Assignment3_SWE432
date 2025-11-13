//module user, exported here
export class User {
    constructor(name, genre) {
        this.name = name;
        this.genre = genre;
        this.experience = 0;
    }

    introduce() {
        console.log(this.name + " specializes in " + this.genre + " music.");
    }

    addExperience(years) {
        this.experience = this.experience + years;
    }

    getInfo() {
        return "DJ: " + this.name + ", Genre: " + this.genre;
    }
}