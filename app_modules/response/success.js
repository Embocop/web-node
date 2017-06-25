const standard = {
    success: true,
    status: 200,
    data: {}
}
const success = {
    ExperimentCreated() {
        return standard
    },
    BindData(data) {
        standard.data = data
        return standard
    }
}

module.exports = success;