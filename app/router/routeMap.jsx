/**
 * 作业报告
 */
import React from 'react'
import { Router, Redirect, Route, IndexRoute , Link, hashHistory } from 'react-router'

import App from '../containers'
import Home from '../containers/Home'
import HomeworkHome from '../containers/HomeworkHome'
import IndexHomework from '../containers/IndexHomework'
import DecorateHomework from '../containers/DecorateHomework'
import NoPublishHomework from '../containers/NoPublishHomework'
import DecorateSelected from '../containers/DecorateHomework/subpage'
import HomeworkReport from '../containers/HomeworkReport'
import CorrectHomework from '../containers/CorrectHomework'
import HomeworkDetail from '../containers/HomeworkDetail'
import HomeworkStatistical from '../containers/HomeworkStatistical'
import HomeworkTopicDetail from '../containers/HomeworkTopicDetail'
import HomeworkStudentDetail from '../containers/HomeworkStudentDetail'
import HomeworkCollect from '../containers/HomeworkCollect'
import HomeworkCollectTopic from '../containers/HomeworkCollect/subpage'
import HomeworkClass from '../containers/HomeworkClass'
import HomeworkClassDetail from '../containers/HomeworkClass/subpage'
import HomeworkClassStuhistory from '../containers/HomeworkClass/subpage/subpage'
import PersonalCenter from '../containers/PersonalCenter/'
import PdfPreview from '../containers/PdfPreview/'
import EditAgain from '../containers/EditAgain/'
import ClassroomExercise from '../containers/ClassroomExercise/'
import ExerciseDetail from '../containers/ExerciseDetail/'
import ExerciseSelected from '../containers/ExerciseSelected/'
import ClassroomRecord from '../containers/ClassroomRecord/'
import ClassroomRecordDetail from '../containers/ClassroomRecordDetail/'
import ClassroomRecordTopicDetail from '../containers/ClassroomRecordTopicDetail/'

import Search from '../containers/Search'
import NotFound from '../containers/404'
//import 'antd/dist/antd.css'

// 如果是大型项目，router部分就需要做更加复杂的配置
// 参见 https://github.com/reactjs/react-router/tree/master/examples/huge-apps


class RouterMap extends React.Component {
    render() {
        return (
            <Router history={this.props.history}>
                <Redirect from="/" to="/homework-home" />
                <Route path='/' component={App}>
                    <Route path='/home' component={Home}>
                        <Route path='/homework-home' component={HomeworkHome}>
                            <IndexRoute  component={ClassroomExercise}>
                            </IndexRoute>
                            <Route  path='/index-homework' component={IndexHomework}/>
                            <Route  path='/decorate-homework/:draftId/:fromwhere' component={DecorateHomework}/>
                            <Route  path='/decorate-selected/:draftId/:homeworkId/:editDraftId/:isSelected' component={DecorateSelected}/>
                            <Route  path='/no-publish-homework' component={NoPublishHomework}></Route>
                            <Route  path='/homework-report' component={HomeworkReport}></Route>
                            <Route  path='/homework-detail/:homeworkId/:type/:classId' component={HomeworkDetail}></Route>
                            <Route  path='/homework-statistical/:homeworkId/:type/:classId' component={HomeworkStatistical}></Route>
                            <Route  path='/correct-homework/:homeworkId/:questionStuId/:parentType/:positionTopic/:type/:classId' component={CorrectHomework}></Route>
                            <Route  path='/homework-topic-detail/:homeworkId/:questionId/:type/:classId' component={HomeworkTopicDetail}></Route>
                            <Route  path='/homework-student-detail/:homeworkId/:studentId/:type/:classId' component={HomeworkStudentDetail}></Route>
                            <Route  path='/homework-collect' component={HomeworkCollect}></Route>
                            <Route  path='/homework-collect-topic/:collectId/:collectType' component={HomeworkCollectTopic}></Route>
                            <Route  path='/homework-class' component={HomeworkClass}></Route>
                            <Route  path='/homework-class-detail/:classId' component={HomeworkClassDetail}></Route>
                            <Route  path='/homework-class-stuhistory/:classId/:studentId' component={HomeworkClassStuhistory}></Route>
                            <Route  path='/homework-edit-again/:homeworkId/:draftId/:jumpType/:type/:classId' component={EditAgain}></Route>
                            <Route  path='/classroom-exercise' component={ClassroomExercise}></Route>
                            <Route  path='/exercise-detail/:exerciseId' component={ExerciseDetail}></Route>
                            <Route  path='/exercise-selected/:draftId/:exerciseId/:isSelected' component={ExerciseSelected}></Route>
                            <Route  path='/classroom-record' component={ClassroomRecord}></Route>
                            <Route  path='/classroom-record-detail/:exerciseId' component={ClassroomRecordDetail}></Route>
                            <Route  path='/classroom-record-topic-detail/:exerciseId/:questionId' component={ClassroomRecordTopicDetail}></Route>
                            
                        </Route>
                        <Route title={"首页>个人中心"}  path='/personal-center' component={PersonalCenter}></Route>
                        <Route path='/search/:category(/:keyword)' component={Search}/>
                        <Route path='*' component={NotFound}/>
                    </Route>
                    <Route title={''}  path='/pdf-preview/:draftId/:loginToken' component={PdfPreview}></Route>
                </Route>
            </Router>
        )
    }
}

export default RouterMap
