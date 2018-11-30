import 'antd/dist/antd.css';
import {Table, Input, Button, Form, Divider, Icon} from 'antd';
import React from 'react'
import PropTypes from 'prop-types';
import './EditableTable.css'
import {withTracker} from 'meteor/react-meteor-data';
import Document from "../api/Document.js";
import {Meteor} from "meteor/meteor";
import iziToast from 'iziToast';
import 'izitoast/dist/css/iziToast.min.css'

const FormItem = Form.Item;
const EditableContext = React.createContext();

const EditableRow = ({form, index, ...props}) => (
    <EditableContext.Provider value={form}>
        <tr {...props} />
    </EditableContext.Provider>
);
const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
    static propTypes = {
        record: PropTypes.object,
        editable: PropTypes.bool,
        dataIndex: PropTypes.string,
        handleInsertBelow: PropTypes.func,
        lastRowIndex: PropTypes.number,
        nextFocus: PropTypes.number,
        cleanNextFocus: PropTypes.func
    }

    state = {
        validateStatus: "success",
        helpText: null
    }

    constructor(props) {
        super(props)
        this.onPressEnter = this.onPressEnter.bind(this)
        this.onChange = this.onChange.bind(this)
    }

    checkNextFocus() {
        if (this.props.record !== undefined && this.props.record.key === this.props.nextFocus && this.props.dataIndex === "date") {
            this.input.focus();
            this.props.cleanNextFocus();
        }
    }

    componentDidMount() {
        this.checkNextFocus()
    }

    componentDidUpdate() {
        console.log("[EditableCell] call componentDidUpdate")
        this.checkNextFocus()
    }

    onPressEnter(event) {
        console.log("[EditableCell] On Press Enter")
        this.props.handleInsertBelow(this.props.record.key)
    }

    onChange(e) {
        this.setState({validateStatus: "validating"})
        let value = e.target.value
        const {record, handleSaveCell, dataIndex} = this.props;
        if (dataIndex === "date") {
            let date_match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
            if (value === "") {
                console.log("Date Validate: Empty text")
                this.setState({validateStatus: "error", helpText: "Require date field."})
                return false
            }
            else if (!date_match) {
                console.log("Date Validate: Wrong format")
                this.setState({validateStatus: "error", helpText: "Require format yyyy-mm-dd"})
                return false
            }
            else if (date_match && parseInt(date_match[1]) > 2400) {
                console.log("Date Validate: Require (A.D) Year")
                this.setState({validateStatus: "error", helpText: "Require (A.D) Year"})
                return false
            }
            else if (date_match && parseInt(date_match[2]) > 12) {
                console.log("Date Validate: Month must be {1,12}")
                this.setState({validateStatus: "error", helpText: "Month must be {1,12}"})
                return false
            }
            else if (date_match && parseInt(date_match[3]) > 31) {
                console.log("Date Validate: Date must be {1,31}")
                this.setState({validateStatus: "error", helpText: "Date must be {1,31}"})
                return false
            }
            else {
                this.setState({validateStatus: "success", helpText: null})
                console.log("Date Validate: Success")
            }
        }
        else {
            let money_match = value.match(/^(\d*\.?\d+)$/)
            if (value !== "" && money_match) {
                console.log("Money Validate: Success")
                this.setState({validateStatus: "success", helpText: null})
            }
            else if (value === "") {
                console.log("Money Validate: Success")
                this.setState({validateStatus: "success", helpText: null})
            }
            else {
                console.log("Money Validate: Wrong format")
                this.setState({validateStatus: "error", helpText: "Require digit xxxx.xx"})
                return false
            }
        }
        handleSaveCell(record.key, dataIndex, value)
        return true
    }

    render() {
        const {
            editable,
            dataIndex,
            title,
            record,
            index,
            handleSaveCell,
            handleInsertBelow,
            lastRowIndex,
            nextFocus,
            cleanNextFocus,
            ...restProps
        } = this.props;
        return (
            <td ref={node => (this.cell = node)} {...restProps}>
                {editable ?
                    <EditableContext.Consumer>
                        {(form) => {
                            this.form = form;
                            return <div>
                                <FormItem style={{margin: 0}} hasFeedback={this.state.validateStatus === "error"}
                                          validateStatus={this.state.validateStatus}
                                          help={this.state.helpText}>
                                    {form.getFieldDecorator(dataIndex, {
                                        initialValue: record[dataIndex]
                                    })(
                                        <Input
                                            ref={node => (this.input = node)}
                                            onPressEnter={this.onPressEnter}
                                            onChange={this.onChange}
                                        />
                                    )}
                                </FormItem>
                            </div>
                        }}
                    </EditableContext.Consumer>
                    : restProps.children}
            </td>
        );
    }
}

class EditableTable extends React.Component {
    constructor(props) {
        console.log("[EditableTable] Call constructor")
        super(props);
        this.columns = [
            {
                title: '',
                key: 'no',
                render: (text, record) => <span>{record.key}</span>,
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
                        this.state.dataSource.length >= 1
                            ? (<span>
                        <span className={"link"} onClick={() => this.handleInsertAbove(record.key)} href="javascript:;">
                            <Icon type="up"/>
                            </span>
                        <Divider type="vertical"/>
                        <span className={"link"} onClick={() => this.handleInsertBelow(record.key)} href="javascript:;">  <Icon
                            type="down"/></span>
                        <Divider type="vertical"/>
                        <span className={"link"} style={{color: 'red'}} onClick={() => this.handleDelete(record.key)}
                              href="javascript:;">  <Icon type="delete"/></span>
                            </span>) : null
                    );
                },
            }];
        this.state = {
            dataSource: [],
            count: 0,
            isInitialDataLoaded: false,
            nextFocus: null
        };
        this.resetDataRowIndex = this.resetDataRowIndex.bind(this)
        this.onClickVerifyAndSave = this.onClickVerifyAndSave.bind(this)
        this.cleanNextFocus = this.cleanNextFocus.bind(this)
    }

    componentDidUpdate() {
        console.log("Call [EditableTable] componentDidUpdate")
        console.log(this.state)
        if (this.props.docsReadyYet && !this.state.isInitialDataLoaded) {
            console.log("Doc Ready!")
            let transactions = this.props.document["transactions"]
            for (let i = 0; i < transactions.length; i++) {
                transactions[i]["key"] = i
            }
            this.setState({dataSource: transactions, count: transactions.length})
            this.state.isInitialDataLoaded = true
        }
        // console.log("get form")
        // console.log(this.props.form)
        // if (this.props.form !== undefined) {
        //     console.log(this.props.form.getFieldsError())
        // }
    }

    componentDidMount() {
        console.log("Call [EditableTable] componentDidMount")
    }

    cleanNextFocus() {
        this.setState({nextFocus: null})
    }

    createNewData(key) {
        let newData = {
            key: key,
            date: '',
            debit: '',
            credit: '',
            balance: ''
        };
        return newData
    }

    resetDataRowIndex(dataSource) {
        for (let i = 0; i < dataSource.length; i++) {
            dataSource[i]["key"] = i
        }
    }

    handleInsertAbove = (key) => {
        let {count, dataSource} = this.state;
        let index = dataSource.findIndex(item => key === item.key);
        dataSource.splice(index, 0, this.createNewData(index))
        this.resetDataRowIndex(dataSource)
        this.setState({
            dataSource: dataSource,
            count: count + 1,
            nextFocus: index
        });

    }
    handleInsertBelow = (key) => {
        let {count, dataSource} = this.state;
        let index = dataSource.findIndex(item => key === item.key) + 1;
        dataSource.splice(index, 0, this.createNewData(index))
        this.resetDataRowIndex(dataSource)
        this.setState({
            dataSource: dataSource,
            count: count + 1,
            nextFocus: index
        });
    }

    handleDelete = (key) => {
        const dataSource = [...this.state.dataSource];
        let dataSourceNew = dataSource.filter(item => item.key !== key)
        this.resetDataRowIndex(dataSourceNew)
        this.setState({dataSource: dataSourceNew, nextFocus: null});
    }

    handleAdd = () => {
        const {count, dataSource} = this.state;
        const newData = this.createNewData(count)
        let dataSourceNew = [...dataSource, newData]
        this.resetDataRowIndex(dataSourceNew)
        this.setState({
            dataSource: dataSourceNew,
            count: count + 1,
            nextFocus: count
        });
    }

    handleSaveCell = (key, dataIndex, value) => {
        console.log("[EditableTable] Handle save cell")
        const newData = [...this.state.dataSource];
        const index = newData.findIndex(item => key === item.key);
        newData[index][dataIndex] = value
        this.setState({dataSource: newData});
    }

    onClickVerifyAndSave(event) {
        console.log("[EditableTable] Click Verify And Save ")
        event.preventDefault()
        Meteor.call('sendVerifyAndSaveRequest', this.props.document._id, this.state.dataSource, (err, result) => {
            console.log("Callback from Meteor method 'sendVerifyAndSaveRequest'")
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
            }
        })
    }

    render() {
        const {dataSource} = this.state;
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
                onCell: record => ({
                    record,
                    editable: col.editable,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    handleSaveCell: this.handleSaveCell,
                    handleInsertBelow: this.handleInsertBelow,
                    lastRowIndex: (this.state.count - 1),
                    nextFocus: this.state.nextFocus,
                    cleanNextFocus: this.cleanNextFocus
                }),
            };
        });
        return (
            <div>
                <Button onClick={this.handleAdd} type="primary"
                        style={{marginBottom: 16}}>
                    <Icon type="plus-circle"/> Add row
                </Button>
                {this.props.docsReadyYet ?
                    <Table
                        components={components}
                        rowClassName={() => 'editable-row'}
                        bordered
                        dataSource={this.state.dataSource}
                        columns={columns}
                    /> : <div>Loading...</div>}
                <div style={{textAlign: "center"}}>
                    <Button type="primary" onClick={this.onClickVerifyAndSave}>
                        <Icon type="check-circle"/>Verify and Save
                    </Button>
                </div>
            </div>
        );
    }
}

export default EditableTableContainer = withTracker(() => {
    const document_handle = Meteor.subscribe('document.all', (err) => {
        console.log("Call back after subscribe")
    });
    const docsReadyYet = document_handle.ready();
    const document = Document.findOne()
    return {
        docsReadyYet,
        document
    };
})(EditableTable);
