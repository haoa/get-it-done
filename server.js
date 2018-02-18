const {
  GraphQLServer
} = require('graphql-yoga')
const {
  Todo,
  Project
} = require('./orm')
const _ = require('lodash')

const typeDefs = `
  type Query {
    allTodos: [Todo!]!
    allProjects: [Project!]!
  }

  type Mutation {
    addTodo(name:String!, done:Boolean!, due: String, projectId:String): Todo
    updateTodo(id: String!, name: String, done: Boolean, due: String, projectId: String): Todo
    removeTodo(id: String!): Boolean
    addProject(name: String!): Project
    removeProject(id: String!): Boolean
    assignTodoToProject(todoId: String!, projectId: String): Boolean
  }

  type Todo {
    id: String!
    name: String!
    done: Boolean!
    due: String
    project: Project
  }

  type Project {
    id: String!
    name: String!
    todos: [Todo!]
  }
`

const resolvers = {
  Query: {
    allTodos: () => Todo.findAll().then(todos => todos.map(todo => {
      if (todo.due) todo.due = todo.due.toString()
      return todo.getProject()
        .then(project => {
          if (project) todo.project = project
          return todo
        })
    })),
    allProjects: () => {
      console.log("all projects")
      return Project.findAll().then(projects => projects)
    }
  },
  Mutation: {
    addTodo: (root, args) => {
      let newTodo = {
        name: args.name,
        done: args.done,
        due: args.due ?
          Date.parse(args.due) :
          undefined
      };
      return Todo.create(newTodo)
        .then(todo => {
          if (args.projectId) {
            return Project.findById(parseInt(args.projectId))
              .then(project => {
                todo.setProject(project)
                return todo;
              })
          } else {
            return todo
          }
        })
    },
    updateTodo: (root, args) => {

      Todo.findById(parseInt(args.id))
        .then(todo => {

          if (args.name) todo.name = args.name
          if (args.done !== undefined) todo.done = args.done
          if (args.due) todo.due = args.due ?
            Date.parse(args.due) :
            undefined
          return todo.save()
            .then(todo => {

              return todo
            })
        })
    },
    removeTodo: (root, args) => {
      return Todo.findById(parseInt(args.id))
        .then(todo => todo.destroy()
          .then(removedTodo => {
            return removedTodo !== null
          }))
    },
    addProject: (root, args) => {
      let newProject = {
        name: args.name
      }
      return Project.create(newProject)
    },
    removeProject: (root, args) => {
      return Project.findById(parseInt(args.id))
        .then(project => project.destroy()
          .then(removedProject => {
            return removedProject !== null
          }))
    },
    assignTodoToProject: (root, args) => {
      Todo.findById(parseInt(args.todoId))
        .then(todo => {
          if (args.projectId) {
            Project.findById(parseInt(args.projectId))
              .then(project => {
                todo.setProject(project)
              })
          } else {
            todo.setProject(null).then(res => console.log(res))
          }
        })
      /*  Project.findById(parseInt(args.projectId))
         .then(project => {
           
               project.getTodos()
                 .then(todos => {
                   let newTodos = _.concat(todos, todo)
                   project.setTodos(newTodos).then(() => {
                     return true
                   })
                 })
             })
         }) */
    }
  }
}

const server = new GraphQLServer({
  typeDefs,
  resolvers
})
server.start(() => console.log('Server is running on localhost:4000'))