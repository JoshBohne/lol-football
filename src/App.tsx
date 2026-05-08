import { Route, Switch } from "wouter";
import { Layout } from "@/components/Layout";
import { HomePage } from "@/pages/Home";
import { BuildPage } from "@/pages/Build";
import { LineupPage } from "@/pages/Lineup";
import { StatsPage } from "@/pages/Stats";
import { NotFoundPage } from "@/pages/NotFound";

export default function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/lineup" component={LineupPage} />
        <Route path="/build" component={BuildPage} />
        <Route path="/stats" component={StatsPage} />
        <Route component={NotFoundPage} />
      </Switch>
    </Layout>
  );
}
