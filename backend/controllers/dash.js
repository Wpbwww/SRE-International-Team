const asyncWrapper = require("../middleware/async");
const { createCustomError } = require("../errors/custom-error");
const RepoSchema = require("../models/repo");
const ObjectId = require("mongodb").ObjectId;

const { Octokit } = require("@octokit/core");
//const { OctokitRest } = require("@octokit/rest");

const res = require("express/lib/response");
const octokit = new Octokit({
  auth: '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',//auth token
});
const dayjs = require("dayjs");
const GetMessage = async (req, res) => {
  try {
    const repoMessage = await octokit.request("GET /repos/{owner}/{repo}", {//提取github数据
      owner: req.body.owner,
      repo: req.body.repoName,
    });
    console.log("auth token available")
    const CreateRepo = await RepoSchema.create({//将数据存入数据库中
      name: repoMessage.data.name,
      owner: repoMessage.data.owner.login,
      uploader: req.body.user,
      forks: repoMessage.data.forks,
      stars: repoMessage.data.watchers,
      open_issues: repoMessage.data.open_issues,
      commit_frequency: await RepoGetCommitFrequency(
        { startTime: dayjs(Date()).subtract(1, 'month'), endTime: dayjs(Date()) },
        repoMessage.data.owner.login,
        repoMessage.data.name
      ),
      issue_frequency: await RepoGetIssueFrequency(
        { startTime: dayjs(Date()).subtract(1, 'month'), endTime: dayjs(Date()) },
        repoMessage.data.owner.login,
        repoMessage.data.name
      ),
      pull_frequency: await RepoGetPullFrequency(
        { startTime: dayjs(Date()).subtract(1, 'month'), endTime: dayjs(Date()) },
        repoMessage.data.owner.login,
        repoMessage.data.name
      ),
      contributors: await RepoGetContributors(
        repoMessage.data.owner.login,
        repoMessage.data.name
      ),
      timeline: {
        created_at: repoMessage.data.created_at,
        updated_at: repoMessage.data.updated_at,
        pushed_at: repoMessage.data.pushed_at,
        recent_released_at: await RepoGetReleaseTime(
          repoMessage.data.owner.login,
          repoMessage.data.name
        ),
      },
      language: await RepoGetLanguage(
        repoMessage.data.owner.login,
        repoMessage.data.name
      ),

      company: await RepoGetOrg(repoMessage.data.owner.login, repoMessage.data.name),

      versions: await GetReleases(
        repoMessage.data.owner.login,
        repoMessage.data.name
      ),
      time: { startTime: dayjs(Date()).subtract(1, 'month').toDate(), endTime: dayjs(Date()).toDate() },

    });
    res.status(201).json({ status: "success!" });
  } catch (err) {
    res.status(404).json(err);
  }
};


function compareCompanies(a, b) {
  if (a.count < b.count) {
    return -1;
  }
  if (a.count > b.count) {
    return 1;
  }
  return 0;
}

const RepoGetOrg = async (owner, name) => {
  console.log("getting company info...");
  const repoMessage = await octokit.request(
    "GET /repos/{owner}/{repo}/contributors",
    {
      owner: owner,
      repo: name,
      per_page: 100,
    }
  );


  var result = [];
  let resMap = new Map();

  for (
    var i = 0;
    i < (repoMessage.data.length < 100 ? repoMessage.data.length : 100);
    i++
  ) {
    const userMessage = await octokit.request("GET /users/{username}", {
      username: repoMessage.data[i].login,
    });

    var company = userMessage.data.company;
    var ss = {
      name: repoMessage.data[i].login,
      avatar_url: repoMessage.data[i].avatar_url,
      contributions: repoMessage.data[i].contributions,
    };

    if (company == null) {
      company = "None";
    }

    if (resMap.has(company)) {
      var com = resMap.get(company);
      com.count = com.count + 1;
      com.employees.push(ss);
      resMap.set(company, com);
    }
    else {
      var com = {
        name: company,
        count: 1,
        employees: [ss],
      };
      resMap.set(company, com);
    }

  }

  var arr = Array.from(resMap.values());
  arr.sort(compareCompanies).reverse();

  return arr;


}

const SearchRepoName = async (req, res) => {
  try {
    const SearchKey = req.body.search.trim();
    if (SearchKey == "") {
      var search = await RepoSchema.find({});
    } else
      search = await RepoSchema.find({
        name: { $regex: SearchKey, $options: "$i" },
      });
    var repos = [];
    for (var i in search) {
      var eachRepo = {
        _id: search[i]._id.toString(),
        name: search[i].name,
        owner: search[i].owner,
        stars: search[i].stars,
        uploader: search[i].uploader,
        uploaded_time: search[i]._id.getTimestamp(),
      };
      repos.push(eachRepo);
    }
    //console.log(repos);
    return res.status(201).json({ repos });
  } catch (err) {
    res.status(404).json(err);
  }
};


const GetReleases = async (owner, name) => {
  console.log("getting releases...");
  const repoMessage = await octokit.request(
    "GET /repos/{owner}/{repo}/releases",
    {
      owner: owner,
      repo: name,
    }
  );
  let versionArr = [];

  for (var release in repoMessage.data) {
    var tag = repoMessage.data[release].tag_name;
    var name = repoMessage.data[release].name;
    var start = repoMessage.data[release].published_at;
    var sDate = dayjs(start);
    var nextDate;
    if (parseInt(release) > 0) {
      nextDate = dayjs(repoMessage.data[parseInt(release) - 1].published_at);
    }
    else {
      nextDate = dayjs(Date());
    }

    let rel = { "tag": tag, "name": name, "start": sDate, "end": nextDate };
    versionArr.push(rel);
  }
  return versionArr;
};

const GetDashboard = async (req, res) => {
  try {
    const detail = await RepoSchema.findOne({ _id: ObjectId(req.body.id) });
    res.status(201).json({ detail });
  } catch (err) {
    res.status(404).json(err);
  }
};

const DeleteRepo = async (req, res) => {
  try {
    const test = await RepoSchema.deleteOne({ _id: ObjectId(req.body.id) });
    res.status(201).json({ msg: "success!" });
  } catch (err) {
    res.status(404).json(err);
  }
};

const CountDayPull = (Msg) => {
  var order = {};
  var result = {};

  for (var i in Msg.data) {
    var t = Msg.data[i].updated_at.substring(0, 10);
    formalLength = Object.keys(order).length;
    if (!(t in result)) {
      order[formalLength.toString()] = t;
      result[t] = 1;
    } else {
      result[t] += 1;
    }
  }
  var pra = Math.floor((Object.keys(order).length - 1) / 6) + 1;
  var answer = {};
  var a = Math.floor(Object.keys(order).length / pra);
  if (pra == 1) {
    for (var i = 0; i < a; i++) {
      answer[order[i.toString()]] = result[order[i.toString()]];
    }
    return answer;
  }
  for (var i = 0; i < a; i++) {
    pp = order[i * pra];
    var sum = 0;
    for (var j = i * pra; j <= i * pra + pra - 1; j++) {
      sum += result[order[j.toString()]];
    }
    answer[pp] = sum;
  }
  return answer;
};

const RepoGetPullFrequency = async (time, owner, name) => {
  console.log("getting pull frequency...");
  const { startTime, endTime } = time;
  //开始时间、结束时间
  //根据时间提取github数据
  const repoMessage = await octokit.request(
    "GET /repos/{owner}/{repo}/pulls",
    {
      owner: owner,
      repo: name,
      per_page: 100,
      page: 1,
      sort: 'updated',
      direction: 'desc',
    }
  );

  if (repoMessage.data.length == 0) return { 2021: "0", 2020: "0", 2019: "0" };
  var i = 2
  while (true) {
    console.log(i)
    const NextRepoMessage = await octokit.request(
      "GET /repos/{owner}/{repo}/pulls",
      {
        owner: owner,
        repo: name,
        per_page: 100,
        page: i,
        sort: 'updated',
        direction: 'desc',
      }
    );
    i++;
    if (NextRepoMessage.data.length == 0) break;
    else {
      if (dayjs(NextRepoMessage.data[NextRepoMessage.data.length - 1].updated_at).isBefore(startTime) || NextRepoMessage.data.length < 100) {
        repoMessage.data = repoMessage.data.concat(NextRepoMessage.data);
        break;
      }
      repoMessage.data = repoMessage.data.concat(NextRepoMessage.data);
    }
  }
  try {
    var startIndex = findStartDesc(repoMessage, endTime)
    var endIndex = findEndDesc(repoMessage, startTime)
    repoMessage.data = repoMessage.data.slice(startIndex, endIndex)//将超过结束时间的数据剔除
  } catch (err) {
    console.log("pull error time selection error")
  }
  const x1 = repoMessage.data[0].updated_at;
  const x2 =
    repoMessage.data[repoMessage.data.length - 1].updated_at;
  const t1 = TransDate(x1);
  const t2 = TransDate(x2);
  var frequency = {};
  if (t1 - t2 < 2) {
    frequency = CountDayPull(repoMessage);
  } else if (t1 - t2 > 15) {
    year1 = Math.floor(t1 / 12);
    year2 = Math.floor(t2 / 12);
    frequency = CountYearPull(year1, year2, repoMessage.data);
  } else {
    frequency = CountMonthPull(t1, t2, repoMessage.data);
  }
  return frequency;

}

const findStartDesc = (Msg, time) => {
  var min = 0;
  var max = Msg.data.length - 1;
  while (min <= max) {
    var Next = Math.floor((max + min) / 2);
    console.log(min, Next, Msg.data[Next].updated_at)
    if (dayjs(Msg.data[Next].updated_at).isSame(time)) {
      return Next;
    } else if (dayjs(Msg.data[Next].updated_at).isAfter(time)) {
      min = Next + 1;
    } else {
      max = Next - 1;
    }
  }
  if (min < 0) min = 0;
  if (dayjs(Msg.data[min].updated_at).isAfter(time)) {
    return min + 1
  }
  return min;
}
const findEndDesc = (Msg, time) => {
  var min = 0;
  var max = Msg.data.length - 1;
  while (min <= max) {
    var Next = Math.floor((max + min) / 2);
    if (dayjs(Msg.data[Next].updated_at).isSame(time)) {
      return Next + 1;
    } else if (dayjs(Msg.data[Next].updated_at).isAfter(time)) {
      min = Next + 1;
    } else {
      max = Next - 1;
    }
  }
  if (min > Msg.data.length - 1) min = Msg.data.length - 1;
  if (dayjs(Msg.data[min].updated_at).isBefore(time)) {
    return min + 1
  }
  return min;
}
const RepoGetCommitFrequency = async (time, owner, name) => {
  console.log("getting commit frequency...");
  const { startTime, endTime } = time
  //开始时间、结束时间
  //根据时间提取github数据
  const repoMessage = await octokit.request(
    "GET /repos/{owner}/{repo}/commits",
    {
      owner: owner,
      repo: name,
      per_page: 100,
      page: 1,
      since: startTime.toDate(),
      until: endTime.toDate()
    }
  );

  if (repoMessage.data.length == 0) return { 2021: "0", 2020: "0", 2019: "0" };
  var i = 2
  while (true) {
    const NextRepoMessage = await octokit.request(
      "GET /repos/{owner}/{repo}/commits",
      {
        owner: owner,
        repo: name,
        per_page: 100,
        page: i,
        since: startTime.toDate(),
        until: endTime.toDate()
      }
    );
    i++;
    if (NextRepoMessage.data.length == 0) break;
    else {
      if (dayjs(NextRepoMessage.data[0].commit.committer.date).isAfter(endTime) || NextRepoMessage.data.length < 100) {
        repoMessage.data = repoMessage.data.concat(NextRepoMessage.data);
        break;
      }
      repoMessage.data = repoMessage.data.concat(NextRepoMessage.data);
    }
  }
  const x1 = repoMessage.data[0].commit.committer.date;
  const x2 =
    repoMessage.data[repoMessage.data.length - 1].commit.committer.date;
  const t1 = TransDate(x1);
  const t2 = TransDate(x2);
  var frequency = {};
  if (t1 - t2 < 2) {
    frequency = CountDayCommit(repoMessage);
  } else if (t1 - t2 > 15) {
    year1 = Math.floor(t1 / 12);
    year2 = Math.floor(t2 / 12);
    frequency = CountYearCommit(year1, year2, repoMessage.data);
  } else {
    frequency = CountMonthCommit(t1, t2, repoMessage.data);
  }
  return frequency;
};

const CountDayCommit = (Msg) => {
  var order = {};
  var result = {};

  for (var i in Msg.data) {
    var t = Msg.data[i].commit.committer.date.substring(0, 10);
    formalLength = Object.keys(order).length;
    if (!(t in result)) {
      order[formalLength.toString()] = t;
      result[t] = 1;
    } else {
      result[t] += 1;
    }
  }
  var pra = Math.floor((Object.keys(order).length - 1) / 6) + 1;
  var answer = {};
  var a = Math.floor(Object.keys(order).length / pra);
  if (pra == 1) {
    for (var i = 0; i < a; i++) {
      answer[order[i.toString()]] = result[order[i.toString()]];
    }
    return answer;
  }
  for (var i = 0; i < a; i++) {
    pp = order[i * pra];
    var sum = 0;
    for (var j = i * pra; j <= i * pra + pra - 1; j++) {
      sum += result[order[j.toString()]];
    }
    answer[pp] = sum;
  }
  return answer;
};

const RepoGetIssueFrequency = async (time, owner, name) => {
  console.log("getting issue frequency...");
  const { startTime, endTime } = time
  //开始时间、结束时间
  //根据时间提取github数据
  const repoMessage = await octokit.request(
    "GET /repos/{owner}/{repo}/issues",
    {
      owner: owner,
      repo: name,
      per_page: 100,
      page: 1,
      sort: 'updated',
      direction: 'asc',
      since: startTime.toDate(),
    }
  );
  if (repoMessage.data.length == 0) return { 2021: "0", 2020: "0", 2019: "0" };
  var i = 2
  while (true) {
    const NextRepoMessage = await octokit.request(
      "GET /repos/{owner}/{repo}/issues",
      {
        owner: owner,
        repo: name,
        per_page: 100,
        page: i,
        sort: 'updated',
        direction: 'asc',
        since: startTime.toDate(),
      }
    );
    i++;
    if (NextRepoMessage.data.length === 0) break;
    else {
      if (dayjs(NextRepoMessage.data[0].updated_at).isAfter(endTime) || NextRepoMessage.data.length < 100) {
        //当提取到的数据中的第一条数据时间超过结束时间时停止提取数据
        repoMessage.data = repoMessage.data.concat(NextRepoMessage.data);
        break;
      }
      repoMessage.data = repoMessage.data.concat(NextRepoMessage.data);
    }
  }
  var endIndex = findEndAsc(repoMessage, endTime)
  repoMessage.data = repoMessage.data.slice(0, endIndex)//将超过结束时间的数据剔除
  if (repoMessage.data.length == 0) return { 2021: "0", 2020: "0", 2019: "0" };
  const x1 = repoMessage.data[0].updated_at;
  const x2 = repoMessage.data[repoMessage.data.length - 1].updated_at;
  const t1 = TransDate(x1);
  const t2 = TransDate(x2);
  var frequency = {};
  if (t1 - t2 < 2) {
    frequency = CountDayIssue(repoMessage);
  } else if (t1 - t2 > 15) {
    year1 = Math.floor(t1 / 12);
    year2 = Math.floor(t2 / 12);
    frequency = CountYearIssue(year1, year2, repoMessage.data);
  } else {
    frequency = CountMonthIssue(t1, t2, repoMessage.data);
  }
  return frequency;
};
const findEndAsc = (Msg, time) => {
  var min = 0;
  var max = Msg.data.length - 1;
  while (min <= max) {
    var Next = Math.floor((max + min) / 2);
    if (dayjs(Msg.data[Next].updated_at).isSame(time)) {
      return Next + 1;
    } else if (dayjs(Msg.data[Next].updated_at).isBefore(time)) {
      min = Next + 1;
    } else {
      max = Next - 1;
    }
  }
  if (min > Msg.data.length - 1) min = Msg.data.length - 1;
  if (dayjs(Msg.data[min].updated_at).isBefore(time)) {
    return min + 1
  }
  return min;
}
const CountDayIssue = (Msg) => {
  var order = {};
  var result = {};

  for (var i in Msg.data) {
    var t = Msg.data[i].updated_at.substring(0, 10);
    formalLength = Object.keys(order).length;
    if (!(t in result)) {
      order[formalLength.toString()] = t;
      result[t] = 1;
    } else {
      result[t] += 1;
    }
  }
  var pra = Math.floor((Object.keys(order).length - 1) / 6) + 1;
  var answer = {};
  var a = Math.floor(Object.keys(order).length / pra);
  if (pra == 1) {
    for (var i = 0; i < a; i++) {
      answer[order[i.toString()]] = result[order[i.toString()]];
    }
    return answer;
  }
  for (var i = 0; i < a; i++) {
    pp = order[i * pra];
    var sum = 0;
    for (var j = i * pra; j <= i * pra + pra - 1; j++) {
      sum += result[order[j.toString()]];
    }
    answer[pp] = sum;
  }
  return answer;
};

const TransDate = (date) => {
  year = date.substring(0, 4);
  month = date.substring(5, 7);
  year1 = parseInt(year, 10);
  month1 = parseInt(month, 10);
  return (year1 - 2000) * 12 + month1 - 1;
};

const CountYearCommit = (year1, year2, commitmsg) => {
  var countNum = new Array(year1 - year2 + 1).fill(0);
  commitmsg.map((x) => {
    year0 = Math.floor(TransDate(x.commit.committer.date) / 12);
    countNum[year1 - year0] += 1;
  });

  var obj = {};
  for (var i = year1; i >= year2; i--) {
    nn = i + 2000;
    cc = nn + "";
    obj[cc] = countNum[year1 - i];
  }
  return obj;
};

const CountYearPull = (year1, year2, commitmsg) => {
  var countNum = new Array(year1 - year2 + 1).fill(0);
  commitmsg.map((x) => {
    year0 = Math.floor(TransDate(x.updated_at) / 12);
    countNum[year1 - year0] += 1;
  });

  var obj = {};
  for (var i = year1; i >= year2; i--) {
    nn = i + 2000;
    cc = nn + "";
    obj[cc] = countNum[year1 - i];
  }
  return obj;
};

const CountYearIssue = (year1, year2, commitmsg) => {
  var countNum = new Array(year1 - year2 + 1).fill(0);
  commitmsg.map((x) => {
    year0 = Math.floor(TransDate(x.updated_at) / 12);
    countNum[year1 - year0] += 1;
  });
  var obj = {};
  for (var i = year1; i >= year2; i--) {
    nn = i + 2000;
    cc = nn + "";
    obj[cc] = countNum[year1 - i];
  }
  return obj;
};

const CountMonthCommit = (t1, t2, commitmsg) => {
  var countNum = new Array(t1 - t2 + 1).fill(0);
  commitmsg.map((x) => {
    t = TransDate(x.commit.committer.date);
    countNum[t1 - t] += 1;
  });

  var obj = {};
  for (var i = t1; i >= t2; i--) {
    mm = (i % 12) + 1;
    nn = (i - mm + 1) / 12 + 2000;
    cc = mm > 9 ? nn + "-" + mm : nn + "-0" + mm;
    obj[cc] = countNum[t1 - i];
  }
  return obj;
};

const CountMonthPull = (t1, t2, commitmsg) => {
  var countNum = new Array(t1 - t2 + 1).fill(0);
  commitmsg.map((x) => {
    t = TransDate(x.updated_at);
    countNum[t1 - t] += 1;
  });

  var obj = {};
  for (var i = t1; i >= t2; i--) {
    mm = (i % 12) + 1;
    nn = (i - mm + 1) / 12 + 2000;
    cc = mm > 9 ? nn + "-" + mm : nn + "-0" + mm;
    obj[cc] = countNum[t1 - i];
  }
  return obj;
};

const CountMonthIssue = (t1, t2, commitmsg) => {
  var countNum = new Array(t1 - t2 + 1).fill(0);
  commitmsg.map((x) => {
    t = TransDate(x.updated_at);
    countNum[t1 - t] += 1;
  });

  var obj = {};
  for (var i = t1; i >= t2; i--) {
    mm = (i % 12) + 1;
    nn = (i - mm + 1) / 12 + 2000;
    cc = mm > 9 ? nn + "-" + mm : nn + "-0" + mm;
    obj[cc] = countNum[t1 - i];
  }
  return obj;
};

const RepoGetContributors = async (owner, name) => {
  console.log("getting contributors...")
  const repoMessage = await octokit.request(
    "GET /repos/{owner}/{repo}/contributors",
    {
      owner: owner,
      repo: name,
    }
  );

  var result = [];
  for (
    var i = 0;
    i < (repoMessage.data.length < 5 ? repoMessage.data.length : 5);
    i++
  ) {
    const userMessage = await octokit.request("GET /users/{username}", {
      username: repoMessage.data[i].login,
    });
    var ss = {
      name: repoMessage.data[i].login,
      avatar_url: repoMessage.data[i].avatar_url,
      contributions: repoMessage.data[i].contributions,
      company: userMessage.data.company,
      public_repos: userMessage.data.public_repos,
      public_gists: userMessage.data.public_gists,
      followers: userMessage.data.followers,
      created_at: userMessage.data.created_at,
    };
    result.push(ss);
  }
  return result;
};

const RepoGetReleaseTime = async (owner, name) => {
  console.log("getting release times...");
  const repoMessage = await octokit.request(
    "GET /repos/{owner}/{repo}/releases",
    {
      owner: owner,
      repo: name,
    }
  );
  if (!repoMessage.data.length) return "not published yet!";
  return repoMessage.data[0].published_at;
};

const RepoGetLanguage = async (owner, name) => {
  console.log("getting languages...");
  const repoMessage = await octokit.request(
    "GET /repos/{owner}/{repo}/languages",
    {
      owner: owner,
      repo: name,
    }
  );
  return repoMessage.data;
};
const TimeSelection = async (req, res) => {
  try {
    const repoMessage = await octokit.request("GET /repos/{owner}/{repo}", {
      owner: req.body.owner,
      repo: req.body.repoName,
    });
    console.log("auth token available")
    const where_Str = { _id: req.body.id }
    const startTime = dayjs(req.body.startTime)
    const endTime = dayjs(req.body.endTime)
    const Update_Str = {
      name: repoMessage.data.name,
      owner: repoMessage.data.owner.login,
      uploader: req.body.user,
      forks: repoMessage.data.forks,
      stars: repoMessage.data.watchers,
      open_issues: repoMessage.data.open_issues,
      commit_frequency: await RepoGetCommitFrequency(
        { startTime, endTime },
        repoMessage.data.owner.login,
        repoMessage.data.name
      ),
      issue_frequency: await RepoGetIssueFrequency(
        { startTime, endTime },
        repoMessage.data.owner.login,
        repoMessage.data.name
      ),
      pull_frequency: await RepoGetPullFrequency(
        { startTime, endTime },
        repoMessage.data.owner.login,
        repoMessage.data.name
      ),
      contributors: await RepoGetContributors(
        repoMessage.data.owner.login,
        repoMessage.data.name
      ),
      timeline: {
        created_at: repoMessage.data.created_at,
        updated_at: repoMessage.data.updated_at,
        pushed_at: repoMessage.data.pushed_at,
        recent_released_at: await RepoGetReleaseTime(
          repoMessage.data.owner.login,
          repoMessage.data.name
        ),
      },
      language: await RepoGetLanguage(
        repoMessage.data.owner.login,
        repoMessage.data.name
      ),
      company: await RepoGetOrg(repoMessage.data.owner.login, repoMessage.data.name),
      versions: await GetReleases(
        repoMessage.data.owner.login,
        repoMessage.data.name
      ),
      time: { startTime: startTime.toDate(), endTime: endTime.toDate() }
    }
    const updateRepo = await RepoSchema.updateOne(where_Str, Update_Str);
    res.statÍus(201).json({ status: "success!" });
  } catch (err) {
    res.status(404).json(err);
  }
};
module.exports = {
  GetMessage,
  SearchRepoName,
  GetDashboard,
  DeleteRepo,
  TimeSelection,
};
