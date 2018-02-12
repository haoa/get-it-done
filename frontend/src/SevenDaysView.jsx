import React from 'react'
import Todo from './Todo'
import { List } from 'antd'
import moment from 'moment'
import _ from 'lodash'
import './SevenDaysView.css'

const SevenDaysView = ({ todos, projects }) => (
    <div>
        {_.range(7).map((index) => {
            let day = moment().add(index, 'days'),
                daysTodos = todos.filter((todo) => day.isSame(moment(todo.due), 'day') && !todo.done)
            return (
                <List
                    key={'day-' + index}
                    size="large"
                    bordered
                    header={<div style={{fontSize:22, fontWeight: 'bold'}}>{index === 0 && 'Heute' || day.format('dddd, DD.MM.')}</div>}
                    dataSource={daysTodos}
                    renderItem={(todo) => (
                        <Todo key={todo.id} todo={todo} projects={projects} />
                    )}
                >

                </List>
            )
        })}
    </div>
)

export default SevenDaysView