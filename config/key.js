if(process.env.NODE_ENV === 'production'){
    console.log('T')
    module.exports = require('./prod');
}else{
    console.log('F')
    module.exports = require('./dev');
    console.log('FALSE')
}