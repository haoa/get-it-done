import gql from 'graphql-tag'

const NEW_TASK_MUTATION = gql`
mutation addTodo($name: String!, $done: Boolean!, $due: String, $projectId: String) {
  addTodo(name: $name, done: $done, due: $due, projectId: $projectId) {
    name
    done
    due
  }
}
`

const UPDATE_TASK_MUTATION = gql`
mutation updateTodo($id:String!, $name: String, $done: Boolean, $due: String, $projectId: String) {
  updateTodo(id: $id, name: $name, done: $done, due: $due, projectId: $projectId) {
    name
    done
    due
  }
}
`

const REMOVE_TASK_MUTATION = gql`
mutation removeTodo($id:String!) {
  removeTodo(id: $id)
}
`

const ASSIGN_TASK_TO_PROJECT_MUTATION = gql`
mutation assignTodoToProject($todoId: String!, $projectId: String) {
  assignTodoToProject(todoId: $todoId, projectId: $projectId)
}
`

const NEW_PROJECT_MUTATION = gql`
mutation addProject($name: String!) {
  addProject(name: $name) {
    id
    name
  }
}
`

export { 
  NEW_TASK_MUTATION, 
  UPDATE_TASK_MUTATION,
  REMOVE_TASK_MUTATION,
  ASSIGN_TASK_TO_PROJECT_MUTATION,
  NEW_PROJECT_MUTATION
 }