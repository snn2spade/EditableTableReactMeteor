import 'antd/dist/antd.css';
import {Input, Form} from 'antd';
import React from 'react'
import PropTypes from 'prop-types';
import {EditableContext} from './EditableTable.jsx'

const FormItem = Form.Item;

export default class EditableCell extends React.Component {
    static propTypes = {
        record: PropTypes.object,
        editable: PropTypes.bool,
        dataIndex: PropTypes.string,
        handleInsertBelow: PropTypes.func,
        nextFocus: PropTypes.number,
        cleanNextFocus: PropTypes.func,
        addCellListener: PropTypes.func,
        removeCellListener: PropTypes.func
    }

    state = {
        validateStatus: "success",
        helpText: null
    }

    constructor(props) {
        super(props)
        this.onPressEnter = this.onPressEnter.bind(this)
        this.validateCell = this.validateCell.bind(this)
    }

    checkNextFocus() {
        if (this.props.record !== undefined && this.props.record.no === this.props.nextFocus && this.props.dataIndex === "date") {
            this.input.focus();
            this.props.cleanNextFocus();
        }
    }

    componentDidMount() {
        this.checkNextFocus()
        if (this.props.addCellListener !== undefined) {
            this.props.addCellListener(this)
        }
    }

    componentWillUnmount() {
        console.log("[EditableCell] will unmount")
        if (this.props.removeCellListener !== undefined) {
            this.props.removeCellListener(this.props.record.key)
        }
    }

    componentDidUpdate() {
        console.log("[EditableCell] call componentDidUpdate")
        this.checkNextFocus()
    }

    onPressEnter(event) {
        console.log("[EditableCell] On Press Enter")
        this.props.handleInsertBelow(this.props.record.key)
    }

    validateCell() {
        this.setState({validateStatus: "validating"})
        let value = this.input.props.value
        const {record, handleSaveCell, dataIndex} = this.props;
        if (dataIndex === "date") {
            let date_match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
            if (value === "") {
                console.log("Date Validate: Require date field.")
                // this.setState({validateStatus: "error", helpText: "Require date field."})
                this.setState({validateStatus: "error"})
                return false
            }
            else if (!date_match) {
                console.log("Date Validate: Require format yyyy-mm-dd\"")
                // this.setState({validateStatus: "error", helpText: "Require format yyyy-mm-dd"})
                this.setState({validateStatus: "error"})
                return false
            }
            else if (date_match && parseInt(date_match[1]) > 2400) {
                console.log("Date Validate: Require (A.D) Year")
                // this.setState({validateStatus: "error", helpText: "Require (A.D) Year"})
                this.setState({validateStatus: "error"})
                return false
            }
            else if (date_match && parseInt(date_match[2]) > 12) {
                console.log("Date Validate: Month must be {1,12}")
                // this.setState({validateStatus: "error", helpText: "Month must be {1,12}"})
                this.setState({validateStatus: "error"})
                return false
            }
            else if (date_match && parseInt(date_match[3]) > 31) {
                console.log("Date Validate: Date must be {1,31}")
                // this.setState({validateStatus: "error", helpText: "Date must be {1,31}"})
                this.setState({validateStatus: "error"})
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
                console.log("Money Validate: Require digit xxxx.xx")
                // this.setState({validateStatus: "error", helpText: "Require digit xxxx.xx"})
                this.setState({validateStatus: "error"})
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
            nextFocus,
            cleanNextFocus,
            addCellListener,
            removeCellListener,
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
                                            onChange={this.validateCell}
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