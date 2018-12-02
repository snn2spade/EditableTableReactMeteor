import 'antd/dist/antd.css';
import {Table, Button, Form, Divider, Icon, Tag, Col, Row} from 'antd';
import React from 'react'
import PropTypes from 'prop-types';
import './EditableTable.css'
import {withTracker} from 'meteor/react-meteor-data';
import Document from "../api/Document.js";
import {Meteor} from "meteor/meteor";
import iziToast from 'iziToast';
import 'izitoast/dist/css/iziToast.min.css'
import EditableCell from './EditableCell.jsx'

export const EditableContext = React.createContext();
const EditableRow = ({form, index, ...props}) => (
    <EditableContext.Provider value={form}>
        <tr {...props} />
    </EditableContext.Provider>
);
const EditableFormRow = Form.create()(EditableRow);


class EditableTable extends React.Component {
    constructor(props) {
        console.log("[EditableTable] Call constructor");
        super(props);
        this.columns = [
            {
                title: '',
                key: 'no',
                dataIndex: 'no',
                // render: (text, record) => <span>{record.no}</span>,
                width: 50
            }, {
                title: 'date',
                dataIndex: 'date',
                width: 200,
                editable: true,
            }, {
                title: 'debit',
                dataIndex: 'debit',
                width: 200,
                editable: true,
            }, {
                title: 'credit',
                dataIndex: 'credit',
                width: 200,
                editable: true,
            }, {
                title: 'balance',
                dataIndex: 'balance',
                width: 200,
                editable: true,
            }, {
                title: '',
                dataIndex: 'action',
                width: 200,
                render: (text, record) => {
                    return (
                        this.state.isEditing
                            ? (<span>
                        <span className={"link"} onClick={() => this.handleInsertAbove(record.key)}>
                            <Icon type="up"/>
                            </span>
                        <Divider type="vertical"/>
                        <span className={"link"} onClick={() => this.handleInsertBelow(record.key)}>  <Icon
                            type="down"/></span>
                        <Divider type="vertical"/>
                        <span className={"link"} style={{color: 'red'}} onClick={() => this.handleDelete(record.key)}
                        >  <Icon type="delete"/></span>
                            </span>) :
                            (<span>
                         <span style={{color: 'grey'}}>  <Icon type="up"/></span>
                        <Divider type="vertical"/>
                         <span style={{color: 'grey'}}>  <Icon type="down"/></span>
                        <Divider type="vertical"/>
                        <span style={{color: 'grey'}}>  <Icon type="delete"/></span></span>)
                    );
                },
            }];
        this.state = {
            dataSource: [],
            count: 0,
            isInitialDataLoaded: false,
            nextFocus: null,
            cellListenerList: [],
            isEditing: false
        };
        EditableTable.resetDataRowNo = EditableTable.resetDataRowNo.bind(this);
        this.onClickVerifyAndSave = this.onClickVerifyAndSave.bind(this);
        this.cleanNextFocus = this.cleanNextFocus.bind(this);
        this.addCellListener = this.addCellListener.bind(this);
        this.removeCellListener = this.removeCellListener.bind(this)
        this.toggleEditingMode = this.toggleEditingMode.bind(this)
    }

    componentDidUpdate() {
        console.log("Call [EditableTable] componentDidUpdate");
        console.log(this.state);
        if (this.props.docsReadyYet && !this.state.isInitialDataLoaded) {
            console.log("Doc Ready!");
            let transactions = this.props.document["transactions"];
            // set up transactions no. and key
            for (let i = 0; i < transactions.length; i++) {
                transactions[i]["key"] = i;
                transactions[i]["no"] = i + 1
            }
            this.setState({dataSource: transactions, count: transactions.length});
            this.state.isInitialDataLoaded = true
        }
    }

    addCellListener(cell) {
        console.log("Add listener: " + cell.props.record.key);
        let cellListenerList = this.state.cellListenerList;
        cellListenerList.push(cell);
        this.setState({cellListenerList: cellListenerList})
    }

    removeCellListener(key) {
        console.log("Remove listener: " + key);
        this.state.cellListenerList =  this.state.cellListenerList.filter(c => (c.props.record.key !== key));
        this.setState({cellListenerList:  this.state.cellListenerList})
    }

    componentDidMount() {
        console.log("Call [EditableTable] componentDidMount")
    }

    cleanNextFocus() {
        this.setState({nextFocus: null})
    }

    static createNewData(key) {
        let newData = {
            key: key,
            no: '',
            date: '',
            debit: '',
            credit: '',
            balance: ''
        };
        return newData
    }

    handleInsertAbove = (key) => {
        let {count, dataSource} = this.state;
        let index = dataSource.findIndex(item => key === item.key);
        let no = dataSource[index].no;
        dataSource.splice(index, 0, EditableTable.createNewData(count));
        EditableTable.resetDataRowNo(dataSource);
        this.setState({
            dataSource: dataSource,
            count: count + 1,
            nextFocus: no
        });

    };

    /**
     * Reset transaction no.
     * @param dataSource
     */
    static resetDataRowNo(dataSource) {
        for (let i = 0; i < dataSource.length; i++) {
            dataSource[i]["no"] = i + 1
        }
    }

    handleInsertBelow = (key) => {
        let {count, dataSource} = this.state;
        let index = dataSource.findIndex(item => key === item.key);
        let no = dataSource[index].no;
        dataSource.splice(index + 1, 0, EditableTable.createNewData(count));
        EditableTable.resetDataRowNo(dataSource);
        this.setState({
            dataSource: dataSource,
            count: count + 1,
            nextFocus: no + 1
        });
    };

    handleDelete = (key) => {
        const dataSource = [...this.state.dataSource];
        let dataSourceNew = dataSource.filter(item => item.key !== key);
        EditableTable.resetDataRowNo(dataSourceNew);
        this.setState({dataSource: dataSourceNew, nextFocus: null, count: this.state.count - 1});
    };

    handleAdd = () => {
        const {count, dataSource} = this.state;
        const newData = EditableTable.createNewData(count);
        let dataSourceNew = [...dataSource, newData];
        EditableTable.resetDataRowNo(dataSourceNew);
        this.setState({
            dataSource: dataSourceNew,
            count: count + 1,
            nextFocus: count + 1
        });
    };

    handleSaveCell = (key, dataIndex, value) => {
        console.log("[EditableTable] Handle save cell");
        const newData = [...this.state.dataSource];
        const index = newData.findIndex(item => key === item.key);
        newData[index][dataIndex] = value;
        this.setState({dataSource: newData});
    };

    onClickVerifyAndSave(event) {
        console.log("[EditableTable] Click Verify And Save ");
        event.preventDefault();
        let haveFailValidated = false;
        let cellListenList = this.state.cellListenerList;
        let firstHelpText = "";
        cellListenList.sort((a, b) => (a.props.record.no - b.props.record.no));
        for (let i = 0; i < cellListenList.length; i++) {
            let cell = cellListenList[i];
            let validateCellResult = cell.validateCell();
            if (!validateCellResult[0] && !haveFailValidated) {
                cell.input.input.focus();
                firstHelpText = validateCellResult[1];
                haveFailValidated = true
            }
        }
        if (!haveFailValidated) {
            Meteor.call('sendVerifyAndSaveRequest', this.props.document._id, this.state.dataSource, (err, result) => {
                console.log("Callback from Meteor method 'sendVerifyAndSaveRequest'");
                if (err) {
                    iziToast.error({
                        title: 'Error',
                        message: 'Verify failed, ...',
                        position: 'topRight'
                    });
                }
                else {
                    iziToast.success({
                        title: 'Success',
                        message: 'Verify Passed, Saved',
                        position: 'topRight'
                    });
                    this.setState({isEditing: false})
                }
            });
            return true
        }
        else {
            iziToast.error({
                title: 'Error',
                message: firstHelpText,
                position: 'topRight'
            });
            return false
        }
    }

    toggleEditingMode() {
        this.setState({isEditing: !this.state.isEditing})
    }

    render() {
        const components = {
            body: {
                row: EditableFormRow,
                cell: EditableCell,
            },
        };
        const columns = this.columns.map((col) => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => {
                    return {
                        record,
                        editable: col.editable,
                        dataIndex: col.dataIndex,
                        title: col.title,
                        handleSaveCell: this.handleSaveCell,
                        handleInsertBelow: this.handleInsertBelow,
                        nextFocus: this.state.nextFocus,
                        cleanNextFocus: this.cleanNextFocus,
                        addCellListener: this.addCellListener,
                        removeCellListener: this.removeCellListener,
                        isEditing: this.state.isEditing
                    }
                },
            };
        });
        return (
            <Form>
                <Button onClick={this.handleAdd} type="default"
                        style={{marginBottom: 16}}>
                    <Icon type="plus"/> Add row
                </Button>
                {this.props.docsReadyYet ?
                    <Table
                        size={"small"}
                        components={components}
                        rowClassName={() => 'editable-row'}
                        bordered
                        dataSource={this.state.dataSource}
                        columns={columns}
                        pagination={false}
                        scroll={{y: 400}}
                    /> : <div>Loading...</div>}
                <div style={{textAlign: "center", marginTop: "16px"}}>
                    {this.state.isEditing ?
                        <Button type="default" onClick={this.toggleEditingMode}>
                            <Icon type="lock"/> Disable Editing
                        </Button> :
                        <Button type="default" onClick={this.toggleEditingMode}>
                            <Icon type="unlock"/> Enable Editing
                        </Button>}

                    <Button type="primary" onClick={this.onClickVerifyAndSave} style={{marginLeft: "10px"}}>
                        <Icon type="check"/>Verify and Save
                    </Button>
                </div>
            </Form>
        );
    }
}

// const WrappedFormEditableTable = Form.create()(EditableTable);

export default EditableTableContainer = withTracker(() => {
    const document_handle = Meteor.subscribe('document.all', (err) => {
        console.log("Call back after subscribe")
    });
    const docsReadyYet = document_handle.ready();
    const document = Document.findOne();
    return {
        docsReadyYet,
        document
    };
})(EditableTable);
