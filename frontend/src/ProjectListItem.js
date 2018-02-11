import React, { Component } from 'react'
import { DropTarget } from 'react-dnd'
import { Menu, Icon } from 'antd'
import { graphql } from 'react-apollo'
import { ASSIGN_TASK_TO_PROJECT_MUTATION } from './mutations'
import { TODOS_QUERY } from './queries'

const todoTarget = {
  drop(props, monitor) {
    let todo = monitor.getItem().todo
    let {project} = props
    props.AssignTaskToProjectMutation({
      variables: {
          todoId: todo.id.toString(),
          projectId: (project && project.id) || null,
      },
      refetchQueries: [{ query: TODOS_QUERY }]
    })
  }
}

const collect = (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
}

const dropTarget = DropTarget("TodoListItem", todoTarget, collect)(
  (props) => {
      let { isOver, connectDropTarget, project } = props
      return connectDropTarget(
        !isOver
        ? <div style={{
          opacity: 0,
          position: "absolute",
          width: 200,
          height: 40,
          left: 0,
          zIndex: 1000
        }}
        key={project.name + "dropArea"}>
        </div>
        : <div style={{
          backgroundColor: "tomato", 
          opacity: 0.2,
          position: "absolute",
          width: 200,
          height: 40,
          left: 0,
          zIndex: 1000}}></div>
        )}
)

export default graphql(ASSIGN_TASK_TO_PROJECT_MUTATION, { name: 'AssignTaskToProjectMutation' })(dropTarget)