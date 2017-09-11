class Success {
    constructor() {
        this.status = 200;
    }
}

class CreationSuccess extends Success {
    constructor(id) {
        super();
        this.status = 201;
        this.code = 201;
        this.title = 'Successfully Created';
        this.details = 'Your entry was successfully created';
        this.data = id;
    }
}

class DeletionSuccess extends Success {
    constructor() {
        super();
        this.status = 202;
        this.code = 202;
        this.title = 'Successfully Deleted';
        this.details = 'Your entry was successfully deleted';
    }
}

class EntryExists extends Success {
    constructor(data) {
        super();
        this.status = 200;
        this.code = 202;
        this.title = 'Entry Exists';
        this.details = 'Your entry exists';
        this.data = data;
    }
}

module.exports = {
    Success,
    CreationSuccess,
    DeletionSuccess,
    EntryExists,
};
