import React, { Component } from 'react'
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'
import { TODOS_QUERY } from './queries'
import { NEW_TASK_MUTATION } from './mutations'
import { Input } from 'antd'
const Search = Input.Search

class NewTask extends Component {
    state = { value: "" }

    onChange(event) {
        this.setState({ value: event.target.value })
    }

    onKeyUp(event) {
        let variables = { name: this.state.value, done: false }
        if(this.props.projectId) {
            variables = { name: this.state.value, done: false, projectId: this.props.projectId }
        }
        this.props.mutate({
            variables: variables,
            refetchQueries: [{ query: TODOS_QUERY }]
        })
            .then(({ data }) => {
                let todo = data.addTodo
                if (todo.name === this.state.value) {
                    this.setState({ value: "" })
                }
            })
    }

    render() {
        return (
            <div style={{backgroundColor:"#f0f2f5", padding:"14px"}}>
                <Search
                    size="large"
                    onPressEnter={this.onKeyUp.bind(this)}
                    onChange={this.onChange.bind(this)}
                    placeholder="Neue Aufgabe"
                    value={this.state.value}
                    enterButton="Hinzufügen"
                    onSearch={this.onKeyUp.bind(this)} />
            </div>
        )
    }
}

export default graphql(NEW_TASK_MUTATION)(NewTask)