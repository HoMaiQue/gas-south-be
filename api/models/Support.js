module.exports={
    attributes:{
        title:{
            type : 'string'
        },
        // content:{
        //     type:'string'
        // },
        createdBy: {
            model: 'user',
        },
      
        updatedBy: {
            model: 'user',
        },
      
        deletedBy: {
            model: 'user',
        },
        isDeleted: {
            type: 'boolean',
            defaultsTo: false,
        },
        createdAt: {
            type: 'string',
            columnType: 'datetime',
            autoCreatedAt: true,
          },
      
        updatedAt: {
            type: 'string',
            columnType: 'datetime',
        },
      
          deletedAt: {
            type: 'string',
            columnType: 'datetime',
          },

          support_img: {
            collection: 'SupportImage',
            via: 'supportID'
          },

          support_content: {
            collection: 'SupportContent',
            via: 'supportID'
          },
    }
}