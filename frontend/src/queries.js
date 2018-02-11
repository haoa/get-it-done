import gql from 'graphql-tag'

const TODOS_QUERY = gql`
query TodosQuery {
  allTodos {
    id
    name
    done
    due
    project {
        id
        name
    }
  }
}
`

const PROJECTS_QUERY = gql`
query ProjectsQuery {
  allProjects {
    id
    name
    todos {
        id
    }
  }
}
`

export { TODOS_QUERY, PROJECTS_QUERY }