import React, { Component } from 'react'
import gql from 'graphql-tag'
import { graphql, compose } from 'react-apollo'
import moment from 'moment'
import 'moment/locale/de';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import _ from 'lodash'
//import 'onsenui/css/onsenui.min.css';
//import 'onsenui/css/onsen-css-components.css';
import './App.css'
import projectColor from './project-colors'
import Todo from './Todo'
import NewTask from './NewTask'
import { TODOS_QUERY, PROJECTS_QUERY } from './queries'
import { NEW_TASK_MUTATION, UPDATE_TASK_MUTATION, NEW_PROJECT_MUTATION, REMOVE_PROJECT_MUTATION } from './mutations'
import { List, DatePicker, Layout,
  Menu, SubMenu, Icon, Input, Button, Spin, Affix } from 'antd'
import { newMap } from 'yaml-ast-parser';
import ProjectListItem from './ProjectListItem';
import SevenDaysView from './SevenDaysView';

const { Content, Header, Sider } = Layout
const MenuItemGroup = Menu.ItemGroup;

const archiveMode = "Erledigt"
const nextSevendaysMode = "Nächste 7 Tage"

moment.locale('de')

const get_done_todos = (todos) => (todos.filter(
  (todo) => todo.done))

const get_todos_for_project = (todos, project) => (todos.filter(
  (todo) => todo.project && todo.project.name === project))

class App extends Component {
  state = {
    todos: [],
    projects: [],
    siderCollapsed: false,
    taskListFilter: null,
    newProjectVisible: false,
    currentProjectName: "",
    currentPage: 1,
    pageSize: 15,
    tryRemovingProject: false
  }

  newProjectInput = null

  componentWillReceiveProps(nextProps) {
    if (nextProps.TodosQuery.allTodos) {
      let filteredTodos = []
      this.state.taskListFilter
      ? this.filterTodos(this.state.taskListFilter, nextProps.TodosQuery.allTodos)
      : this.setState({
        todos: _.cloneDeep(nextProps.TodosQuery.allTodos).filter((todo) => !todo.done),
      })
    }
    if(nextProps.ProjectsQuery.allProjects) {
      this.setState({projects: nextProps.ProjectsQuery.allProjects})
    }
    /*.map(todo => ({
      name: todo.name,
      done: todo.done,
      due: todo.due,
      id: todo.id
    }))*/
  }

  onCollapse(collapsed) {
    this.setState({ siderCollapsed: collapsed })
  }

  filterTodos(taskListFilter, todos) {
    let filteredTodos;
    if(taskListFilter === archiveMode) {
      filteredTodos = _.cloneDeep(todos).filter(
        (todo) => todo.done)
    } else if (taskListFilter === nextSevendaysMode) {
      filteredTodos = _.cloneDeep(todos).filter(
        (todo) => todo.due)
    } else {
      filteredTodos = get_todos_for_project(_.cloneDeep(todos), taskListFilter)
    }
    this.setState({todos: filteredTodos})
  }

  onMenuItemClick(event) {
    let todos = this.props.TodosQuery.allTodos
    if(event.key === "allTasks") {
      this.setState({
        taskListFilter: null,
        todos: _.cloneDeep(todos).filter((todo) => !todo.done)
      })
    } else if(event.key === "newProject") {
      if(!this.state.newProjectVisible) {
        this.setState({newProjectVisible: !this.state.newProjectVisible})
      } 
    } else if(event.key === nextSevendaysMode) {
      this.setState({taskListFilter: nextSevendaysMode})
      this.filterTodos(event.key, todos) 
    } else if(event.key === archiveMode) {
      this.setState({taskListFilter: archiveMode})
      this.filterTodos(event.key, todos) 
    } else {
      this.setState({taskListFilter: event.key})
      this.filterTodos(event.key, todos)
    }
  }

  onPressEnterNewProject(event){
    let projectName = event.target.value
    if(projectName && projectName !== archiveMode && projectName !== nextSevendaysMode){
      this.props.NewProjectMutation({
        variables: {
          name: projectName,
      },
      refetchQueries: [{ query: PROJECTS_QUERY }, { query: TODOS_QUERY }]
      })
      this.setState({
        newProjectVisible: !this.state.newProjectVisible,
        currentProjectName: ""
      })
    } else {
      //TODO: Show Popover for "Archiv not allowed"
      this.setState({
        newProjectVisible: !this.state.newProjectVisible,
        currentProjectName: ""
      })
    }
  }

  onKeyUpNewProject(event){
    if(event.nativeEvent.keyCode == 27){
      this.endNewProject()
    }
  }

  endNewProject(){
    this.setState({
      newProjectVisible: !this.state.newProjectVisible,
      currentProjectName: ""
    })
  }

  onNewProjectChange(event) {
    this.setState({currentProjectName: event.target.value})
  }

  onPageChange(page, pageSize) {
    this.setState({currentPage: page})
  }

  onTryRemoveProject(){
    this.setState({tryRemovingProject: !this.state.tryRemovingProject})
  }

  onRemoveProject() {
    //TODO: tasklistfilter is a bad way or name as there is currentprojectname in state!
    let project = _.find(this.props.ProjectsQuery.allProjects, (project) => project.name === this.state.taskListFilter)
    this.props.RemoveProjectMutation({
      variables: {
        id: project.id,
    },
    refetchQueries: [{ query: PROJECTS_QUERY }, { query: TODOS_QUERY }]
    })
    this.setState({taskListFilter: null})
    //this.onTryRemoveProject()
  }

  render() {
    if (this.props.TodosQuery.loading || this.props.ProjectsQuery.loading) {
      return (<div style={{position: "absolute", width: 160, height: 60, top: 0, bottom: 0, left: 0, right: 0, margin: "auto"}}>
        <Spin indicator={(<Icon type="loading" style={{fontSize: 60}} />)}/>  
        <div>Loading</div>
      </div>)
    }

    return (
      <Layout className="App">
        <Sider
          collapsible
          collapsed={this.state.siderCollapsed}
          onCollapse={this.onCollapse.bind(this)}
          style={{backgroundColor: "#f6f8fa"}}
          ref={node => this.sider = node}
        >
          <div className="logo">
            {
              !this.state.siderCollapsed
                ? "Get It Done"
                : (<div className="logo-collapsed"></div>)
            }
          </div>
          <Affix>
          <Menu
            /* theme="dark" */
            defaultSelectedKeys={['allTasks']}
            defaultOpenKeys={['g1']}
            mode="inline"
            onClick={this.onMenuItemClick.bind(this)}
          >
            <Menu.Item 
              key="allTasks" 
              className="sidebar-menu-item"
              style={{margin: 0, lineHeight: "35px"}}>
              <Icon type="bars" />
              <span>Alle Aufgaben</span>
            </Menu.Item>
            <Menu.Item 
              key={nextSevendaysMode} 
              className="sidebar-menu-item"
              style={{margin: 0, lineHeight: "35px"}}>
              <Icon type="calendar" />
              <span>Nächste 7 Tage</span>
            </Menu.Item>
            <Menu.SubMenu key="g1" title="Projekte" className="submenu-title">
            <Menu.Item key="newProject" className='new-project'>
              {this.state.newProjectVisible
              ? <Input 
                  value={this.state.currentProjectName}
                  autoFocus
                  placeholder="Projektname"
                  onPressEnter={this.onPressEnterNewProject.bind(this)}
                  onKeyUp={this.onKeyUpNewProject.bind(this)}
                  onBlur={this.endNewProject.bind(this)}
                  onChange={this.onNewProjectChange.bind(this)}
                  />
              : (<Button >
                  <Icon type="plus-circle" 
                    style={{    fontSize: "14pt",
                      margin: 0,
                      top: 1,
                      position: "relative"}}
                  />
                  Neues Projekt
                  </Button>)
              }
              </Menu.Item>
            {this.props.ProjectsQuery.allProjects.map((project, index) => {
              return (
                <Menu.Item 
                key={project.name}
                className="sidebar-menu-item project-item"
                >
                  <ProjectListItem project={project} />
                  <Icon style={{ display: "inline-block", backgroundColor: projectColor.backgroundColor[project.id], borderRadius: 10, width: 18, height: 18, marginRight: 6 }}></Icon>
                  <span style={{top: -5, position: "relative"}}>{project.name} ({get_todos_for_project(this.props.TodosQuery.allTodos, project.name).length})</span>
                </Menu.Item>
              )
            })}
            </Menu.SubMenu>
            <Menu.Item
              key={archiveMode}
              className="sidebar-menu-item"
            >
              <Icon type="book" />
              {archiveMode} ({get_done_todos(this.props.TodosQuery.allTodos).length})
            </Menu.Item>
          </Menu>
          </Affix>
        </Sider>
        <Layout>
          <Header className="App-header" style={{backgroundColor: projectColor.backgroundColor[this.state.currentProjectName]}}>
            <h1 className="App-title">{this.state.taskListFilter || "Alle Aufgaben"}</h1>
            {this.state.taskListFilter 
              && (this.state.taskListFilter !== nextSevendaysMode) 
              && (this.state.taskListFilter !== archiveMode) 
              && (this.state.tryRemovingProject 
              ?(<div>
                <Button 
                type="dashed" 
                className="remove-project-button ok-remove"
                onClick={this.onRemoveProject.bind(this)}
                >Ok</Button>
                <Button 
                type="dashed" 
                className="remove-project-button"
                onClick={this.onTryRemoveProject.bind(this)}
                >Abbrechen</Button>
              </div>)
              :(<Button 
                type="dashed" 
                className="remove-project-button"
                onClick={this.onTryRemoveProject.bind(this)}
                >Löschen</Button>)
                )}
          </Header>
          <Content>
            <div className="App-intro">
            {this.state.taskListFilter === nextSevendaysMode
              ? (<SevenDaysView todos={this.state.todos} projects={this.state.projects} />)
              : (<List
              pagination={{
                  pageSize: this.state.pageSize,
                  current: this.state.currentPage,
                  total: this.state.todos.length,
                  onChange: this.onPageChange.bind(this),
                }}
              size="large"
              bordered
              /* header={<div>Filter: <button>Sortieren</button><Input placeholder='Suchen' /></div>} */
              footer={this.state.taskListFilter !== archiveMode
                ? <Affix offsetBottom={0}><NewTask projectId={
                this.state.taskListFilter && this.state.taskListFilter !== archiveMode
                ? _.find(this.props.ProjectsQuery.allProjects, (project) => project.name === this.state.taskListFilter).id
                : null
              }/></Affix>
            : null}
              dataSource={_.sortBy(this.state.todos, (todo) => todo.name.toLowerCase())
                .slice((this.state.currentPage - 1) * this.state.pageSize, this.state.currentPage * this.state.pageSize)}
              renderItem={todo =>
                (<Todo todo={todo} projects={this.state.projects} />
                )}
            >
            </List>)}
            </div>
          </Content>
        </Layout>
      </Layout>
    )
  }
}

const AppContainer = DragDropContext(HTML5Backend)(App)

export default compose(
  graphql(TODOS_QUERY, { name: 'TodosQuery' }),
  graphql(PROJECTS_QUERY, { name: 'ProjectsQuery' }),
  graphql(NEW_PROJECT_MUTATION, { name: 'NewProjectMutation' }),
  graphql(REMOVE_PROJECT_MUTATION, { name: 'RemoveProjectMutation' }),
)(AppContainer)