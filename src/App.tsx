import { Route, Switch } from "wouter";
import { Layout } from "@/components/Layout";
import { BuildPage } from "@/pages/Build";
import { GridPage } from "@/pages/Grid";
import { StatsPage } from "@/pages/Stats";
import { NotFoundPage } from "@/pages/NotFound";

export default function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={BuildPage} />
        <Route path="/grid" component={GridPage} />
        <Route path="/stats" component={StatsPage} />
        <Route component={NotFoundPage} />
      </Switch>
    </Layout>
  );
}
