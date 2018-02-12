import React, { Component } from 'react'
import PropTypes from 'prop-types';
import './Todo.css'
import {
    Checkbox, DatePicker,
    List, Tag, AutoComplete, Input,
    Dropdown, Button, Menu, Icon
} from 'antd';
import { UPDATE_TASK_MUTATION, REMOVE_TASK_MUTATION, ASSIGN_TASK_TO_PROJECT_MUTATION } from './mutations'
import { TODOS_QUERY, PROJECTS_QUERY } from './queries'
import { graphql, compose } from 'react-apollo'
import moment from 'moment'
import { DragSource } from 'react-dnd';
import _ from 'lodash'
import projectColor from './project-colors'

const todoListItemSource = {
    beginDrag(props) {
        return {
            todo: props.todo
        }
    }
}

const noProject = "Kein Projekt"

class Todo extends Component {
    static propTypes = {
        // Injected by React DnD:
        connectDragSource: PropTypes.func.isRequired,
        connectDragPreview: PropTypes.func.isRequired,
        isDragging: PropTypes.bool.isRequired
    };

    constructor(props) {
        super(props)
        let { todo } = props
        this.state = {
            name: todo.name,
            done: todo.done,
            due: todo.due ? moment(todo.due) : null,
            editingProject: false,
            editingName: false,
            editingDue: false,
            project: todo.project ? todo.project : noProject,
            projects: _.concat([noProject], props.projects.map(project => project.name))
        }
    }

    componentWillReceiveProps(nextProps) {
        let { todo } = nextProps
        this.setState({
            name: todo.name,
            done: todo.done,
            due: todo.due ? moment(todo.due) : null,
            project: todo.project ? todo.project : noProject,
            projects: _.concat([noProject], nextProps.projects.map(project => project.name))
        })
    }

    onDueUpdate(momentObj, dateString) {
        this.setState({ due: momentObj })
    }

    onDueOk() {
        this.props.UpdateTaskMutation({
            variables: {
                id: this.props.todo.id.toString(),
                due: this.state.due
                    ? this.state.due.toString()
                    : null
            },
            refetchQueries: [{ query: TODOS_QUERY }]
        })
        this.setState({ editingDue: !this.state.editingDue })
    }

    onCheckedUpdate(event) {
        let checked = event.target.checked
        this.setState({ done: checked })
        this.props.UpdateTaskMutation({
            variables: {
                id: this.props.todo.id.toString(),
                done: checked,
            },
            refetchQueries: [{ query: TODOS_QUERY }]
        })
    }

    onEditNameClick(event) {
        this.setState({ editingName: !this.state.editingName })
    }

    /* updateTodo() {
        this.props.UpdateTaskMutation({
            variables: {
                id: this.props.todo.id.toString(),
                name: this.state.name,
                done: this.state.done,
                due: this.state.due
                    ? this.state.due.toString()
                    : null
            },
            refetchQueries: [{ query: TODOS_QUERY }]
        })
    } */

    removeTask() {
        this.props.RemoveTaskMutation({
            variables: {
                id: this.props.todo.id.toString(),
            },
            refetchQueries: [{ query: TODOS_QUERY }]
        })
    }

    onEditingProject() {
        this.setState({ editingProject: !this.state.editingProject })
    }

    onEditingDue() {
        this.setState({ editingDue: !this.state.editingDue })
    }

    onEditingName(event) {
        this.setState({ name: event.target.value })
    }

    onEditingNameEnd() {
        this.props.UpdateTaskMutation({
            variables: {
                id: this.props.todo.id.toString(),
                name: this.state.name
            },
            refetchQueries: [{ query: TODOS_QUERY }]
        })
        this.setState({ editingName: false })
    }

    updateProject(newProject) {
        let index = _.findIndex(this.props.projects, (project => project.name === newProject))
        let project = index > -1
            ? this.props.projects[index]
            : null
        this.setState({
            project: project || noProject,
            editingProject: !this.state.editingProject
        })
        this.props.AssignTaskToProjectMutation({
            variables: {
                todoId: this.props.todo.id.toString(),
                projectId: (project && project.id) || null,
            },
            refetchQueries: [{ query: TODOS_QUERY }]
        })
    }

    componentDidMount() {
        this.props.connectDragPreview(
            <div style={{
                backgroundColor: "darkGrey",
                color: "white",
                borderRadius: 3,
                border: "1px solid darkBlue"
            }}>
                {this.state.name}
            </div>
        )
    }

    /* <AutoComplete
        placeholder={this.state.project.name || noProject}
        dataSource={this.state.projects}
        onSelect={this.updateProject.bind(this)}
    /> */

    render() {
        const { connectDragSource, connectDragPreview, isDragging } = this.props
        /* 
        <Dropdown trigger="click" overlay={projectMenu}>
                            <Button>Bla</Button>
                        </Dropdown>
        const projectMenu = (
            <Menu onClick={this.updateProject}>
            <Menu.Item key="-1">{noProject}</Menu.Item>
                {this.state.projects.map(project => (
                    <Menu.Item key={project.id}>
                        {project.name}
                    </Menu.Item>
                ))}
            </Menu>
        ) */
        return connectDragPreview(<div>
            <List.Item
                key={this.props.id}
                actions={[
                    !this.state.editingProject
                        ? <Tag
                            style={{ color: projectColor.textColor[this.state.project.id] || "black" }}
                            color={projectColor.backgroundColor[this.state.project.id] || "blue"}
                            onClick={this.onEditingProject.bind(this)}
                        >{this.state.project.name || noProject}
                            <Icon type="edit" style={{ marginLeft: 3 }} />
                        </Tag>
                        : <AutoComplete
                            placeholder={this.state.project.name || noProject}
                            dataSource={this.state.projects}
                            onSelect={this.updateProject.bind(this)}
                        />,
                    !this.state.due || this.state.editingDue
                        ? (<DatePicker
                            format="DD.MM.YYYY HH:MM"
                            showTime
                            locale="de_DE"
                            placeholder="Erledigen bis?"
                            value={this.state.due}
                            onOk={this.onDueOk.bind(this)}
                            onChange={this.onDueUpdate.bind(this)}
                        />)
                        : (<div
                            className={'due-display' + (this.state.due.isBefore(moment()) ? ' over-due' : '')}
                            onClick={this.onEditingDue.bind(this)}
                        >
                            {_.upperFirst(this.state.due.fromNow())}
                            <Icon type="edit" style={{ float: 'right', marginTop: 3 }} />
                        </div>),
                    <a onClick={this.removeTask.bind(this)}>Löschen</a>]}>
                {connectDragSource(<div className="drag-area">
                </div>)}
                {!this.state.editingName
                    ? [<Checkbox
                        key={this.props.id + '_check-box'}
                        defaultChecked={this.state.done}
                        checked={this.state.done}
                        onChange={this.onCheckedUpdate.bind(this)}>
                        {this.state.name}
                    </Checkbox>,
                    <Button
                        key={this.props.id + '_button'}
                        style={{
                            padding: '5px 5px 4px 4px',
                            height: 24,
                            backgroundColor: '#1890ff',
                            color: 'white'
                        }}
                        onClick={this.onEditNameClick.bind(this)}
                    >
                        <Icon type="edit" style={{
                            position: "relative",
                            top: -5,
                        }} />
                    </Button>]
                    : <Input
                        value={this.state.name}
                        autoFocus
                        onChange={this.onEditingName.bind(this)}
                        onBlur={this.onEditingNameEnd.bind(this)}
                        onPressEnter={this.onEditingNameEnd.bind(this)}
                    />
                }
            </List.Item>
        </div>)
    }
}

const TodoContainer = DragSource("TodoListItem", todoListItemSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
}))(Todo)

export default compose(
    graphql(TODOS_QUERY, { name: 'TodosQuery' }),
    graphql(UPDATE_TASK_MUTATION, { name: 'UpdateTaskMutation' }),
    graphql(ASSIGN_TASK_TO_PROJECT_MUTATION, { name: 'AssignTaskToProjectMutation' }),
    graphql(REMOVE_TASK_MUTATION, { name: 'RemoveTaskMutation' }))
    (TodoContainer)