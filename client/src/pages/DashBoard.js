import { useEffect } from "react";
import { useAppContext } from "../context/appContext";
import Loading from "../components/Loading";
import { useParams } from "react-router-dom";
import { Box, Grid, Container, Typography } from "@mui/material";
import {
  CommitNumber,
  Time,
  IssueNumber,
  StarNumber,
  ForkNumber,
  ActivityIndex,
  TimeLine,
  Language,
  PullRequest,
  Contribute,
  CommitFrequency,
  IssueFrequency,
  PullFrequency,
  ContributorList,
  Company,
} from "../components/DashBoard";
export default function DashboardApp() {
  const { id } = useParams();
  const { isLoading, detail, getDashBoard ,refresh} = useAppContext();
  useEffect(() => {
    if(!refresh)getDashBoard(id);
  }, [refresh]);
  const {
    name,
    owner,
    forks,
    stars,
    open_issues,
    timeline,
    language,
    commit_frequency,
    issue_frequency,
    pull_frequency,
    contributors,
    versions,
    company,
    time
  } = detail;
  const repoInfo={id,name,owner}
  if (isLoading) {
    return <Loading center />;
  } else {
    const contribute = {
      name: [],
      contributions: [],
    };

    if (contributors) {
      for (var i = 0; i < Math.min(5, contributors.length); ++i) {
        contribute.name.push(contributors[i].name);
        contribute.contributions.push(contributors[i].contributions);
      }
    }

    return (
      <Container maxWidth="xl">
        <Box sx={{ pb: 5 }}>
          <Typography variant="h4">Report</Typography>
        </Box>
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <TimeLine {...timeline} />
            </Grid>
            <Grid item xs={12} sm={6} md={8}>
              <Time msg={{repoInfo,versions,time}} />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <CommitNumber {...commit_frequency} />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <IssueNumber {...issue_frequency} />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StarNumber total={stars} />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <ForkNumber total={forks} />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <ActivityIndex {...{commit_frequency,issue_frequency,pull_frequency,time}}/>
            </Grid>
            <Grid item xs={12} sm={6} md={12}>
              <CommitFrequency {...commit_frequency} />
            </Grid>
            <Grid item xs={12} sm={6} md={12}>
              <IssueFrequency {...issue_frequency} />
            </Grid>
            <Grid item xs={12} sm={6} md={12}>
              <PullFrequency {...pull_frequency} />
            </Grid>
            <Grid item xs={12} sm={6} md={12}>
              <Language {...language} />
            </Grid>
            <Grid item xs={12} sm={6} md={12}>
              <Contribute {...contribute} />
            </Grid>
            {contributors && (
              <Grid item xs={12} sm={6} md={12}>
                <ContributorList {...contributors} />
              </Grid>
            )}
            <Grid item xs={12} sm={6} md={12}>
              <Company {...company} />
            </Grid>
          </Grid>
        </Box>
      </Container>
    );
  }
}
