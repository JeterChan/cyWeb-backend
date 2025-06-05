const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition:{
        openapi:'3.0.0',
        info:{
            title:'電商網站 API 文件',
            version:'1.0.0',
            description:'API Docs'
        }
    },
    apis:['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;