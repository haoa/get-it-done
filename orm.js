const Sequelize = require('sequelize');
const sequelize = new Sequelize({dialect: 'sqlite',
  storage: './todo.sqlite',
});


const Todo = sequelize.define('todo', {
    name: Sequelize.STRING,
    done: Sequelize.BOOLEAN,
    due: Sequelize.DATE,

});

const Project = sequelize.define('Project', {
    name: Sequelize.STRING,
});

Todo.belongsTo(Project);
Project.hasMany(Todo, {as: 'todos'});

sequelize.sync()
    .then(() => {
        console.log('Database in sync')
    });

exports.Todo = Todo;
exports.Project = Project;