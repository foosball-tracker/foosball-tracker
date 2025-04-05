//@ts-nocheck
import { ColumnDef } from "@tanstack/solid-table";
import { createResource, createSignal, Show } from "solid-js";
import { supabase } from "~/service/supabaseService.ts";
import { DataTable } from "~/components/shared/table/DataTable.tsx";
import PlayerForm from "./PlayerForm";
import ConfirmDelete from "./ConfirmDelete";

// Define the Person type
interface Player {
  id: string;
  name: string;
}
const [selected, setSelected] = createSignal(false);
const [showConfirm, setShowConfirm] = createSignal(false);
const [playerToDelete, setPlayerToDelete] = createSignal(null);
const [showPlayerForm, setShowPlayerForm] = createSignal(false);


// Define columns, including custom cells for a checkbox and an action button.
const columns: ColumnDef<Player>[] = [
  {
    header: "Name",
    accessorKey: "name",
    cell: (info) => info.getValue(),
  },
  {
    header: "Actions",
    cell: (info) => {
      const player = info.row.original;
      return (
        <button class="btn btn-error btn-sm" onClick={() => {
          setPlayerToDelete(player);
          setShowConfirm(true);
        }}>
          Delete
        </button>
      );
    },
  },
];

const getPlayers = async () => {
  const { data, error } = await supabase.from("players").select();
  if (error) {
    console.error("error fetching players", error);
  }
  return data ?? [];
};

const CreatePlayer = async()=>{
  const addPlayer = {
    name: name,
  }
  const {data, error} = await supabase.from('players').insert([addPlayer]).select().single();
  if (error){
    console.log("error creating player", error)
  }
  return data
}


function Players() {
  const [data, { refetch }] = createResource(getPlayers);
  const deletePlayer = async()=>{
    const player = playerToDelete()
    if (!player) return;
    const {error} = await supabase.from('players').delete().eq('id', player.id)
  
    if (error){
      console.log('error deleting', error)
    }else{
      refetch();
      setPlayerToDelete(null);
      setShowConfirm(false)
    }
  }
  const handleCreatePlayerSuccess = () => {
    console.log('refetching')
    refetch();
    setShowPlayerForm(false);
  };

  return (
    <>
      <Show
        when={selected() == false}
        keyed
        fallback={
          <PlayerForm onSuccess={handleCreatePlayerSuccess}/>
        }>
          <div class="h-full p-2">
            <Show
              when={data()}
              keyed
              fallback={
                <div class={"flex h-full items-center justify-center"}>
                  <span class="loading loading-spinner loading-xl" />
                </div>
              }
            >
              {(resolvedData) => <DataTable columns={columns} data={resolvedData}/>}
            </Show>
            <button class="btn btn-primary mx-auto mt-4"onclick={()=>setSelected(!selected())}>Create New Player</button>
          </div>
      </Show>
      {/*use confirm delete component */}
      <ConfirmDelete
        showConfirm={showConfirm()}
        playerToDelete={playerToDelete()}
        onCancel={() => {
          setShowConfirm(false);
          setPlayerToDelete(null);
        }}
        onConfirm={deletePlayer}
      />
    </>
    
  );
}

export default Players;
