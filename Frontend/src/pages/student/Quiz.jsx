import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock3, Flag, ChevronLeft, ChevronRight, Send } from "lucide-react";
import PageTitle from "../../components/common/PageTitle";
import Loading from "../../components/common/Loading";
import { ErrorBox } from "../../components/common/Feedback";
import { useAuth } from "../../context/AuthContext";
import { getQuiz, getQuizQuestions, startAttempt, submitAnswer, finishAttempt } from "../../services/quizService";

export default function Quiz(){
 const {id}=useParams(); const navigate=useNavigate(); const {user}=useAuth();
 const [quiz,setQuiz]=useState(null),[questions,setQuestions]=useState([]),[attempt,setAttempt]=useState(null),[index,setIndex]=useState(0),[answers,setAnswers]=useState({}),[seconds,setSeconds]=useState(30),[loading,setLoading]=useState(true),[error,setError]=useState(""),[submitting,setSubmitting]=useState(false);
 useEffect(()=>{let active=true;(async()=>{try{const [q,qs]=await Promise.all([getQuiz(id),getQuizQuestions(id)]);if(!active)return;setQuiz(q);setQuestions(qs||[]);const a=await startAttempt(user?.id||user?.userId,id);if(active)setAttempt(a);}catch(e){if(active)setError(e.message);}finally{if(active)setLoading(false)}})();return()=>{active=false}},[id,user]);
 const current=questions[index]; const selected=answers[index]??"";
 useEffect(()=>{setSeconds(30)},[index]);
 useEffect(()=>{if(loading||!attempt||!current)return;const timer=setInterval(()=>setSeconds(s=>{if(s<=1){clearInterval(timer);goNext(true);return 30}return s-1}),1000);return()=>clearInterval(timer)},[index,loading,attempt,current]);
 const options=useMemo(()=>current?[current.optionA,current.optionB,current.optionC,current.optionD].filter(v=>v!==null&&v!==undefined):[],[current]);
 async function goNext(auto=false){if(submitting||!current)return;setSubmitting(true);try{await submitAnswer(attempt.id,{questionId:current.id,selectedAnswer:answers[index]||null});if(index<questions.length-1)setIndex(v=>v+1);else{const result=await finishAttempt(attempt.id);navigate(`/student/result/${result.id||id}`,{state:{result,quiz}})}}catch(e){setError(e.message)}finally{setSubmitting(false)}}
 async function finish(){if(!window.confirm("Submit your quiz now?"))return;await goNext()}
 if(loading)return <Loading text="Preparing your quiz..."/>;
 if(error)return <><PageTitle title="Quiz"/><ErrorBox>{error}</ErrorBox></>;
 if(!current)return <><PageTitle title={quiz?.title||"Quiz"}/><div className="panel-card p-6 text-sm text-slate-500">No questions are available for this quiz.</div></>;
 return <><PageTitle title={quiz?.title||quiz?.topic||"Quiz"} subtitle={`${questions.length} questions · 30 seconds per question`}/>
 <div className="mx-auto max-w-4xl"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="text-sm font-medium text-slate-500">Question {index+1} of {questions.length}</div><div className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${seconds<=8?"bg-rose-50 text-rose-600":"bg-indigo-50 text-indigo-700"}`}><Clock3 size={17}/>{seconds}s remaining</div></div><div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-indigo-600 transition-all" style={{width:`${((index+1)/questions.length)*100}%`}}/></div><ErrorBox>{error}</ErrorBox>
 <section className="panel-card p-5 sm:p-8"><div className="mb-6 flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-50 font-bold text-indigo-700">{index+1}</span><h2 className="text-lg font-semibold leading-7 text-slate-900">{current.questionText||current.question||current.text}</h2></div><div className="grid gap-3">{options.map((option,i)=>{const key=["A","B","C","D"][i];return <button key={key} onClick={()=>setAnswers(a=>({...a,[index]:key}))} className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${selected===key?"border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100":"border-slate-200 hover:border-indigo-300 hover:bg-slate-50"}`}><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-bold ${selected===key?"bg-indigo-600 text-white":"bg-slate-100 text-slate-600"}`}>{key}</span><span className="text-sm text-slate-700">{option}</span></button>})}</div><div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row"><button disabled={index===0} onClick={()=>setIndex(v=>v-1)} className="btn-secondary"><ChevronLeft size={17}/> Previous</button>{index===questions.length-1?<button disabled={submitting} onClick={finish} className="btn-primary">{submitting?"Submitting...":"Submit quiz"} <Send size={17}/></button>:<button disabled={submitting} onClick={()=>goNext()} className="btn-primary">Next question <ChevronRight size={17}/></button>}</div></section><p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400"><Flag size={14}/> Your answers are submitted as you move between questions.</p></div></>;
}
