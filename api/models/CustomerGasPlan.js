module.exports = {
    attributes: {

        year: {
            type: 'number'
        },

        month: {
            type: 'number'
        },

        quantity: {
            type: 'number'
        },

        note: {
            type: 'string'
        },

        customerGasId: {
            model: 'customergas'
        },

        // updateAt: {
        //     type: 'string',
        //     columType: 'datetime'
        // },

        isDeleted: {
            type: 'boolean',
            defaultsTo: false
        },
        deletedBy: {
          model: "user",
        },
        
        deletedAt: {
          type: "string",
          columnType: "datetime",
        },

    }
}