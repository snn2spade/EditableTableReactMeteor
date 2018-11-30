import 'antd/dist/antd.css';
import React from 'react'
import {Button, Divider, Table, Icon, Input} from 'antd'


export default class EditableTableNew extends React.Component {
    componentDidUpdate() {
        console.log("[EditableTableNew] component did update")
        console.log(this.state)
    }


    constructor(props) {
        super(props)
        this.columns = [{
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            width: '20%',
            render: (text, record) => {
                console.log(record)
                return <Input placeholder="YYYY-MM-DD" name="date" value={text}
                              onChange={this.handleInputChange}/>
            }
        }, {
            title: 'Credit',
            dataIndex: 'credit',
            key: 'credit',
            width: '20%',
        }, {
            title: 'Debit',
            dataIndex: 'debit',
            key: 'debit',
            width: '20%',
        }, {
            title: 'Balance',
            key: 'balance',
            dataIndex: 'balance',
            width: '20%',
        }, {
            title: 'Action',
            key: 'action',
            width: '20%',
            render: (text, record) => {
                return <span>
                  <a href="javascript:;">Insert Above</a>
                  <Divider type="vertical"/>
                  <a href="javascript:;">Delete</a>
                </span>
            }
        }];
        this.state = {
            dataSource: [{
                key: '0',
                date: '2018-05-01',
                credit: '555.55',
                debit: '',
                balance: '10000.0',
            }, {
                key: '1',
                date: '2018-05-01',
                credit: '545.55',
                debit: '',
                balance: '40000.0',
            }]
        };
        this.handleInputChange = this.handleInputChange.bind(this)
    }

    handleInputChange(event) {
        console.log(event.target.key)
        this.state.dataSource[0][event.target.name] = event.target.value
        this.setState({dataSource: this.state.dataSource});
    }

    render() {
        return <div>
            <Table columns={this.columns} dataSource={this.state.dataSource}/>
            <Button type="primary">
                <Icon type="check-circle"/>Verify and Save
            </Button>
        </div>
    }
}